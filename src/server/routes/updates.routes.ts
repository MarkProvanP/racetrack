import * as express from "express";
import * as winston from "winston";

import { restrictedViewOnly, restrictedBasic, restrictedModifyAll, restrictedSuperuser } from "../auth";
import { DataIntermediary } from "../data-intermediate";

export default function updatesRouterWithDb(dataIntermediate: DataIntermediary) {
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
    dataIntermediate.getStatusUpdates()
      .then(updates => {
        res.json(updates);
      });
  });

  updatesRouter.get('/:id', restrictedViewOnly, (req, res) => {
    let id = req.params.id;
    dataIntermediate.getStatusUpdate(id)
    .catch(err => res.status(500).send())
    .then(update => {
      if (update) {
        res.json(update);
      } else {
        res.status(404).send();
      }
    });
  });

  updatesRouter.post('/', restrictedBasic, (req, res) => {
    let newUpdateProperties = req.body;
    dataIntermediate.createStatusUpdate(newUpdateProperties)
      .then(update => {
        res.json(update);
      });
  });

  updatesRouter.put('/:id', restrictedBasic, (req, res) => {
    let newDetailsUpdate = req.body;
    dataIntermediate.updateTeamUpdate(newDetailsUpdate, req.user)
    .then(changedUpdate => {
      res.json(changedUpdate);
    })
  })

  updatesRouter.delete('/:id', restrictedBasic, (req, res) => {
    let id = req.params.id;
    dataIntermediate.deleteTeamUpdate(id)
    .then(() => {
      res.send('successfully deleted update');
    })
  })

  return updatesRouter;
}

