import * as express from "express";
import * as winston from "winston";

import { Team } from "../../common/team";
import { DataIntermediary } from "../data-intermediate";

export default function teamsRouterWithDb(dataIntermediary: DataIntermediary) {
  let teamsRouter = express.Router();

  teamsRouter.use(function(req, res, next) {
    winston.log('verbose', 'Teams request');
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(401);
      res.send();
    }
  });

  teamsRouter.get('/', function(req, res) {
    dataIntermediary.getTeams()
      .then(teams => {
        res.type('application/json');
        res.send(JSON.stringify(teams));
      });
  })
  teamsRouter.get('/:id', (req, res) => {
    let id = req.params.id;
    dataIntermediary.getTeam(id)
      .then(team => {
        res.type('application/json');
        res.send(JSON.stringify(team));
      });
  })
  teamsRouter.post('/', (req, res) => {
    let body = req.body;
    dataIntermediary.createTeam(body)
      .then(newTeam => {
        res.type('application/json');
        res.send(JSON.stringify(newTeam));
      });
  });
  teamsRouter.put('/:id', (req, res) => {
    let newDetailsTeam = Team.fromJSON(req.body);
    dataIntermediary.updateTeam(newDetailsTeam)
      .then(changedTeam => {
        res.type('application/json');
        res.send(JSON.stringify(changedTeam));
      });
  })
  teamsRouter.delete('/:id', (req, res) => {
    let deletedTeamId = req.params.id;
    dataIntermediary.deleteTeam(deletedTeamId)
      .then(() => {
        res.send('successfully deleted team');
      });
  });
  
  return teamsRouter;
}

