import * as express from "express";
import { DbFacadeInterface } from '../db/db-facade';

import * as winston from "winston";

export default function eventsRouterWithDb(db_facade: DbFacadeInterface) {
  let eventsRouter = express.Router();

  eventsRouter.use((req, res, next) => {
    winston.log('info', 'Events request');
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(401);
      res.send();
    }
  });

  eventsRouter.get('/', (req, res) => {
    winston.log('info', 'GET /');
    if (req.isAuthenticated()) {
      res.json({events: []});
    } else {
      res.status(401);
      res.send();
    }
  });

  return eventsRouter;
}
