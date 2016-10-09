import * as express from "express";
import { DbFacadeInterface } from "../db/db-facade";
import * as winston from "winston";

export default function updatesRouterWithDb(db_facade: DbFacadeInterface) {
let updatesRouter = express.Router();

  updatesRouter.use(function(req, res, next) {
    winston.verbose("Updates request");
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
    let id = req.params.id;
    db_facade.getStatusUpdate(id)
      .then(update => {
        res.type('application/json');
        res.send(JSON.stringify(update));
      });
  });

  updatesRouter.post('/', (req, res) => {
    let newUpdateProperties = req.body;
    db_facade.createStatusUpdate(newUpdateProperties)
      .then(update => {
        res.type("application/json");
        res.send(JSON.stringify(update));
      });
  });

  return updatesRouter;
}

