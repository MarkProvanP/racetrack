import * as express from "express";
import * as winston from "winston";

import { Team } from "../../common/team";
import { DataIntermediary } from "../data-intermediate";
import { restrictedViewOnly, restrictedBasic, restrictedModifyAll, restrictedSuperuser } from "../auth";

export default function teamsRouterWithDb(dataIntermediate: DataIntermediary) {
  let teamsRouter = express.Router();

  teamsRouter.use((req, res, next) => {
    winston.log('verbose', 'Teams request');
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(401);
      res.send();
    }
  });

  teamsRouter.get('/', restrictedViewOnly, (req, res) => {
    dataIntermediate.getTeams()
      .then(teams => {
        res.json(teams)
      });
  })
  teamsRouter.get('/:id', restrictedViewOnly, (req, res) => {
    let id = req.params.id;
    dataIntermediate.getTeam(id)
      .then(team => {
        res.json(team)
      });
  })
  teamsRouter.post('/', restrictedBasic, (req, res) => {
    let body = req.body;
    dataIntermediate.createTeam(body)
      .then(newTeam => {
        res.json(newTeam)
      });
  });
  teamsRouter.put('/:id', restrictedViewOnly, (req, res) => {
    let newDetailsTeam = Team.fromJSON(req.body);
    dataIntermediate.updateTeam(newDetailsTeam, req.user)
      .then(changedTeam => {
        res.json(changedTeam);
      });
  })
  teamsRouter.delete('/:id', restrictedViewOnly, (req, res) => {
    let deletedTeamId = req.params.id;
    dataIntermediate.deleteTeam(deletedTeamId)
      .then(() => {
        res.send('successfully deleted team');
      });
  });
  
  return teamsRouter;
}

