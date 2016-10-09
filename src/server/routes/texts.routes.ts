import * as express from "express";
import { DbFacadeInterface} from "../db/db-facade";
import { Text, InboundText, OutboundText } from '../../common/text';

export default function textsRouterWithDb(db_facade: DbFacadeInterface, twilio) {
  let textsRouter = express.Router();

  textsRouter.use(function(req, res, next) {
    console.log("Texts request");
    next();
  });

  textsRouter.get('/', function(req, res) {
    db_facade.getTexts()
      .then(texts => {
        res.type('application/json');
        res.send(JSON.stringify(texts));
      })
      .catch(err => {
        console.error('textsrouter error', err);
        res.status(500)
        res.json({err: err});
      });
  })

  textsRouter.get('/byNumber/:number', function(req, res) {
    let number = req.params.number
    db_facade.getTextsByNumber(number)
      .then(texts => {
        res.type('application/json');
        res.send(JSON.stringify(texts));
      })
      .catch(err => {
        res.status(500);
        res.json({err: err});
      });
  });

  textsRouter.post('/', (req, res) => {
    let newText = req.body;
    let twilioClient = twilio.client;
    twilioClient.messages.create({
      body: newText.message,
      to: newText.to,
      from: twilio.fromNumber
    }, (err, text) => {
      if (err) {
        console.error('twilio sending error');
        console.error(err);
        res.status(500).send(`Twilio error! : ${err}`);
      } else {
        console.log('successfully sent text', text);
        db_facade.createFromOutboundText(text)
          .then(createdText => {
            res.json(createdText);
          })
          .catch(err => {
            res.status(500).json({err: err});
          })
      }
    });
  });

  textsRouter.put('/:id', (req, res) => {
    let newDetailsText = Text.fromJSON(req.body);
    console.log('updating text');
    console.log(newDetailsText);
    db_facade.updateText(newDetailsText)
      .then(changedText => {
        res.type("application/json");
        res.send(JSON.stringify(changedText));
      });
  });

  return textsRouter;
}
