import * as express from "express";

let updatesRouter = express.Router();

import * as db_facade from "../db-facade";

updatesRouter.use(function(req, res, next) {
  console.log("Updates request");
  next();
});

updatesRouter.get('/', function(req, res) {
  res.type("application/json");
  res.send(JSON.stringify(db_facade.getStatusUpdates()));
});

updatesRouter.get('/:id', (req, res) => {
  let id = Number(req.params.id);
  res.type('application/json');
  res.send(JSON.stringify(db_facade.getStatusUpdate(id)));
});

updatesRouter.post('/', (req, res) => {
  let newUpdateProperties = req.body;
  let newUpdate = db_facade.createUpdate(newUpdateProperties);
  res.type("application/json");
  res.send(JSON.stringify(newUpdate));
});

export default updatesRouter;
