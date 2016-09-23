import * as express from "express";

let teamsRouter = express.Router();

import * as db_facade from "../db-facade";

import { Team } from "../../common/team";

teamsRouter.use(function(req, res, next) {
  console.log('Teams request');
  next();
});

teamsRouter.get('/', function(req, res) {
  res.type('text/json');
  res.send(JSON.stringify(db_facade.getTeams()));
})
teamsRouter.post('/', function(req, res) {
  let newTeamName = req.body.name;
  let newTeam = db_facade.createTeam(newTeamName);
  res.type('application/json');
  res.send(JSON.stringify(newTeam));
});
teamsRouter.put('/:id', function(req, res) {
  let newDetailsTeam = req.body as Team;
  let changedTeam = db_facade.updateTeam(Number(req.params.id), newDetailsTeam);
  res.type('application.json');
  res.send(JSON.stringify(changedTeam));
})
teamsRouter.delete('/:id', function(req, res) {
  let deletedTeamId = Number(req.params.id);
  db_facade.deleteTeam(deletedTeamId);
  res.send('successfully deleted team');
});

export default teamsRouter;
