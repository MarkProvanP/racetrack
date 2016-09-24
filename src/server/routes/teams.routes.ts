import * as express from "express";

let teamsRouter = express.Router();

import { InMemoryDbFacade } from "../db-facade";

let db_facade = new InMemoryDbFacade();

import { Team } from "../../common/team";

teamsRouter.use(function(req, res, next) {
  console.log('Teams request');
  next();
});

teamsRouter.get('/', function(req, res) {
  db_facade.getTeams()
    .then(teams => {
      res.type('application/json');
      console.log(db_facade.getTeams());
      res.send(JSON.stringify(teams));
    });
})
teamsRouter.get('/:id', (req, res) => {
  console.log('get single team');
  let id = Number(req.params.id);
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
  db_facade.updateTeam(Number(req.params.id), newDetailsTeam)
    .then(changedTeam => {
      res.type('application.json');
      res.send(JSON.stringify(changedTeam));
    });
})
teamsRouter.delete('/:id', function(req, res) {
  let deletedTeamId = Number(req.params.id);
  db_facade.deleteTeam(deletedTeamId)
    .then(() => {
      res.send('successfully deleted team');
    });
});

export default teamsRouter;
