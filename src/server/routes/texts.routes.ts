import * as express from "express";
import { DbFacadeInterface} from "../db/db-facade";
import { Text } from '../../common/text';

export default function textsRouterWithDb(db_facade: DbFacadeInterface) {
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
      });
  })

  textsRouter.get('/byNumber/:number', function(req, res) {
    let number = req.params.number
    db_facade.getTextsByNumber(number)
      .then(texts => {
        res.type('application/json');
        res.send(JSON.stringify(texts));
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
