import * as express from "express";
import * as winston from "winston";

import { restrictedViewOnly, restrictedBasic, restrictedModifyAll, restrictedSuperuser } from "../auth";
import { DataIntermediary } from "../data-intermediate";

export default function updatesRouterWithDb(dataIntermediary: DataIntermediary) {
let updatesRouter = express.Router();

  updatesRouter.use((req, res, next) => {
    winston.log('verbose', "Updates request");
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(401);
      res.send();
    }
  });

  updatesRouter.get('/', restrictedViewOnly, (req, res) => {
    dataIntermediary.getStatusUpdates()
      .then(updates => {
        res.type("application/json");
        res.send(JSON.stringify(updates));
      });
  });

  updatesRouter.get('/:id', restrictedViewOnly, (req, res) => {
    let id = req.params.id;
    dataIntermediary.getStatusUpdate(id)
      .then(update => {
        res.type('application/json');
        res.send(JSON.stringify(update));
      });
  });

  updatesRouter.post('/', restrictedBasic, (req, res) => {
    let newUpdateProperties = req.body;
    dataIntermediary.createStatusUpdate(newUpdateProperties)
      .then(update => {
        res.type("application/json");
        res.send(JSON.stringify(update));
      });
  });

  updatesRouter.put('/:id', restrictedBasic, (req, res) => {
    let newDetailsUpdate = req.body;
    dataIntermediary.updateTeamUpdate(newDetailsUpdate, req.user)
    .then(changedUpdate => {
      res.json(changedUpdate);
    })
  })

  updatesRouter.delete('/:id', restrictedBasic, (req, res) => {
    let id = req.params.id;
    dataIntermediary.deleteTeamUpdate(id)
    .then(() => {
      res.send('successfully deleted update');
    })
  })

  return updatesRouter;
}

