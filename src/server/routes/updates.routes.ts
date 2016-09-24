import * as express from "express";

let updatesRouter = express.Router();

import { InMemoryDbFacade } from "../db-facade";
let db_facade = new InMemoryDbFacade();

updatesRouter.use(function(req, res, next) {
  console.log("Updates request");
  next();
});

updatesRouter.get('/', function(req, res) {
  db_facade.getStatusUpdates()
    .then(updates => {
      res.type("application/json");
      res.send(JSON.stringify(updates));
    });
});

updatesRouter.get('/:id', (req, res) => {
  let id = Number(req.params.id);
  db_facade.getStatusUpdate(id)
    .then(update => {
      res.type('application/json');
      res.send(JSON.stringify(update));
    });
});

updatesRouter.post('/', (req, res) => {
  console.log('creating status update');
  let newUpdateProperties = req.body;
  console.log(newUpdateProperties);
  db_facade.createStatusUpdate(newUpdateProperties)
    .then(update => {
      console.log(update);
      res.type("application/json");
      res.send(JSON.stringify(update));
    });
});

export default updatesRouter;
