import * as express from "express";
import { DbFacadeInterface } from "../db/db-facade";
import { Team } from "../../common/team";
import * as winston from "winston";

export default function teamsRouterWithDb(db_facade: DbFacadeInterface) {
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
    db_facade.getTeams()
      .then(teams => {
        res.type('application/json');
        res.send(JSON.stringify(teams));
      });
  })
  teamsRouter.get('/:id', (req, res) => {
    let id = req.params.id;
    db_facade.getTeam(id)
      .then(team => {
        res.type('application/json');
        res.send(JSON.stringify(team));
      });
  })
  teamsRouter.post('/', function(req, res) {
    let body = req.body;
    db_facade.createTeam(body)
      .then(newTeam => {
        res.type('application/json');
        res.send(JSON.stringify(newTeam));
      });
  });
  teamsRouter.put('/:id', function(req, res) {
    let newDetailsTeam = Team.fromJSON(req.body);
    db_facade.updateTeam(req.params.id, newDetailsTeam)
      .then(changedTeam => {
        res.type('application/json');
        res.send(JSON.stringify(changedTeam));
      });
  })
  teamsRouter.delete('/:id', function(req, res) {
    let deletedTeamId = req.params.id;
    db_facade.deleteTeam(deletedTeamId)
      .then(() => {
        res.send('successfully deleted team');
      });
  });
  
  return teamsRouter;
}

