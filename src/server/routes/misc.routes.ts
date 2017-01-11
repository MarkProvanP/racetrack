import * as express from "express";
import * as winston from "winston";

import { Team } from "../../common/team";
import { NotFoundError } from "../errors";
import { DataIntermediary } from "../data-intermediate";

export default function miscRouterWithDb(dataIntermediate: DataIntermediary) {
  let miscRouter = express.Router();

  function AuthCheck(req, res, next) {
    winston.log('verbose', 'Misc request');
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(401);
      res.send();
    }
  }

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

  miscRouter.get('/team-pin/:id', (req, res) => {
    let teamId = req.params.id;
    return dataIntermediate.getTeamMapPinSVG(teamId)
    .then(svg => {
      res.type("image/svg+xml");
      res.send(svg);
    })
    .catch(handleServerError(req, res))
  })
  
  return miscRouter;
}

