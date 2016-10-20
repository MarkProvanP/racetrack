import * as express from "express";
import { DbFacadeInterface } from "../db/db-facade";
import { Team } from "../../common/team";
import * as winston from "winston";

export default function publicRouterWithDb(db_facade: DbFacadeInterface) {
  let publicRouter = express.Router();

  publicRouter.use(function(req, res, next) {
    winston.log('verbose', 'Public Teams request');
    next();
  });

  publicRouter.get('/teams', function(req, res) {
    db_facade.getTeams()
      .then(teams => {
        res.type('application/json');
        res.send(JSON.stringify(teams));
      });
  })
  publicRouter.get('/teams/:id', (req, res) => {
    let id = req.params.id;
    db_facade.getTeam(id)
      .then(team => {
        res.type('application/json');
        res.send(JSON.stringify(team));
      });
  })
  return publicRouter;
}

