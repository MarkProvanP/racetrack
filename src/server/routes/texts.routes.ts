import * as express from "express";

let textsRouter = express.Router();

import * as db_facade from "../db-facade";

textsRouter.use(function(req, res, next) {
  console.log("Texts request");
  next();
});

textsRouter.get('/', function(req, res) {
  res.type('application/json');
  res.send(JSON.stringify(db_facade.getTexts()));
})

textsRouter.get('/byNumber/:number', function(req, res) {
  let number = req.params.number
  res.type('application/json');
  res.send(JSON.stringify(db_facade.getTextsByNumber(number)));
});

export default textsRouter;
