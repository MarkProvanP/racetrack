import * as express from "express";
import * as winston from "winston";

import { Team } from "../../common/team";
import { DataIntermediary } from "../data-intermediate";
import { restrictedViewOnly, restrictedBasic, restrictedModifyAll, restrictedSuperuser } from "../auth";

export default function teamsRouterWithDb(dataIntermediary: DataIntermediary) {
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
    dataIntermediary.getTeams()
      .then(teams => {
        res.type('application/json');
        res.send(JSON.stringify(teams));
      });
  })
  teamsRouter.get('/:id', restrictedViewOnly, (req, res) => {
    let id = req.params.id;
    dataIntermediary.getTeam(id)
      .then(team => {
        res.type('application/json');
        res.send(JSON.stringify(team));
      });
  })
  teamsRouter.post('/', restrictedBasic, (req, res) => {
    let body = req.body;
    dataIntermediary.createTeam(body)
      .then(newTeam => {
        res.type('application/json');
        res.send(JSON.stringify(newTeam));
      });
  });
  teamsRouter.put('/:id', restrictedViewOnly, (req, res) => {
    let newDetailsTeam = Team.fromJSON(req.body);
    dataIntermediary.updateTeam(newDetailsTeam, req.user)
      .then(changedTeam => {
        res.type('application/json');
        res.send(JSON.stringify(changedTeam));
      });
  })
  teamsRouter.delete('/:id', restrictedViewOnly, (req, res) => {
    let deletedTeamId = req.params.id;
    dataIntermediary.deleteTeam(deletedTeamId)
      .then(() => {
        res.send('successfully deleted team');
      });
  });
  
  return teamsRouter;
}

