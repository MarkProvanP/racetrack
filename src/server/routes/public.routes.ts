import * as express from "express";
import { Team } from "../../common/team";
import * as winston from "winston";
import { DataIntermediary } from "../data-intermediate";

export default function publicRouterWithDb(dataIntermediate: DataIntermediary) {
  let publicRouter = express.Router();

  publicRouter.use((req, res, next) => {
    winston.log('verbose', 'Public Teams request');
    next();
  });

  publicRouter.get('/teams', (req, res) => {
    dataIntermediate.getTeams()
      .then(teams => {
        res.json(teams.map(team => team.stripPrivateData()));
      });
  })
  publicRouter.get('/teams/:id', (req, res) => {
    let id = req.params.id;
    dataIntermediate.getTeam(id)
      .then(team => {
        res.json(team.stripPrivateData());
      });
  })
  return publicRouter;
}

