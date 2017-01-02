import * as express from "express";
import { Team } from "../../common/team";
import * as winston from "winston";
import { NotFoundError } from "../errors";
import { DataIntermediary } from "../data-intermediate";

export default function publicRouterWithDb(dataIntermediate: DataIntermediary) {
  let publicRouter = express.Router();

  publicRouter.use((req, res, next) => {
    winston.log('verbose', 'Public Teams request');
    next();
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

  publicRouter.get('/teams', (req, res) => {
    dataIntermediate.getTeams()
    .then(teams => teams.map(t => t.stripPrivateData()))
    .then(teams => res.json(teams))
    .catch(handleServerError(req, res))
  })

  publicRouter.get('/teams/:id', (req, res) => {
    let id = req.params.id;
    dataIntermediate.getTeam(id)
    .then(team => team.stripPrivateData())
    .then(team => res.json(team))
    .catch(handleServerError(req, res))
  })

  return publicRouter;
}

