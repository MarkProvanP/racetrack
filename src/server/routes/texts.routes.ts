import * as express from "express";

let textsRouter = express.Router();

import { InMemoryDbFacade } from "../db-facade";
let db_facade = new InMemoryDbFacade;

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

export default textsRouter;
