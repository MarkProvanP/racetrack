import * as express from "express";
import * as winston from "winston";

import { restrictedViewOnly, restrictedBasic, restrictedModifyAll, restrictedSuperuser } from "../auth";
import { DataIntermediary } from "../data-intermediate";
import { NotFoundError } from "../errors";

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

  function handleServerError(req, res) {
    return (err) => {
      if (err instanceof NotFoundError) {
        res.status(404).send(err.toString());
      } else {
        winston.log('error', err);
        res.status(500).send();
      }
    }
  }

  updatesRouter.get('/', restrictedViewOnly, (req, res) => {
    dataIntermediate.getStatusUpdates()
    .then(updates => res.json(updates))
    .catch(handleServerError(req, res))
  });

  updatesRouter.get('/:id', restrictedViewOnly, (req, res) => {
    let id = req.params.id;
    dataIntermediate.getStatusUpdate(id)
    .then(update => res.json(update))
    .catch(handleServerError(req, res))
  });

  updatesRouter.post('/', restrictedBasic, (req, res) => {
    let newUpdateProperties = req.body;
    dataIntermediate.createStatusUpdate(newUpdateProperties)
    .then(update => res.json(update))
    .catch(handleServerError(req, res))
  });

  updatesRouter.put('/:id', restrictedBasic, (req, res) => {
    let newDetailsUpdate = req.body;
    dataIntermediate.updateTeamUpdate(newDetailsUpdate, req.user)
    .then(update => res.json(update))
    .catch(handleServerError(req, res))
  })

  updatesRouter.delete('/:id', restrictedBasic, (req, res) => {
    let id = req.params.id;
    dataIntermediate.deleteTeamUpdate(id)
    .then(() => res.send())
    .catch(handleServerError(req, res))
  })

  return updatesRouter;
}

