import * as express from "express";
import { DbFacadeInterface} from "../db/db-facade";
import { Text, InboundText, OutboundText } from '../../common/text';
import * as winston from "winston";

export default function textsRouterWithDb(db_facade: DbFacadeInterface, twilio) {
  let textsRouter = express.Router();

  textsRouter.use(function(req, res, next) {
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
        winston.error('Twilio send text error!', {err});
        res.status(500).send(`Twilio error! : ${err}`);
      } else {
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
    db_facade.updateText(newDetailsText)
      .then(changedText => {
        res.type("application/json");
        res.send(JSON.stringify(changedText));
      });
  });

  return textsRouter;
}
