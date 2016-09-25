import * as express from "express";
import { DbFacadeInterface } from "../db/db-facade";
import { Team } from "../../common/team";

export default function teamsRouterWithDb(db_facade: DbFacadeInterface) {
  let teamsRouter = express.Router();

  teamsRouter.use(function(req, res, next) {
    console.log('Teams request');
    next();
  });

  teamsRouter.get('/', function(req, res) {
    db_facade.getTeams()
      .then(teams => {
        console.log('teamsRouter getTeams()')
        console.log(teams);
        res.type('application/json');
        res.send(JSON.stringify(teams));
      });
  })
  teamsRouter.get('/:id', (req, res) => {
    console.log('get single team');
    let id = req.params.id;
    db_facade.getTeam(id)
      .then(team => {
        res.type('application/json');
        res.send(JSON.stringify(team));
      });
  })
  teamsRouter.post('/', function(req, res) {
    let newTeamName = req.body.name;
    db_facade.createTeam(newTeamName)
      .then(newTeam => {
        res.type('application/json');
        res.send(JSON.stringify(newTeam));
      });
  });
  teamsRouter.put('/:id', function(req, res) {
    let newDetailsTeam = req.body as Team;
    console.log("updating team");
    console.log(newDetailsTeam)
    db_facade.updateTeam(req.params.id, newDetailsTeam)
      .then(changedTeam => {
        res.type('application.json');
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

