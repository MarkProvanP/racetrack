import * as express from "express";
import { DbFacadeInterface } from '../db/db-facade';
import { ThingEvent } from "../../common/event";
import * as winston from "winston";
import { restrictedViewOnly, restrictedBasic, restrictedModifyAll, restrictedSuperuser } from "../auth";

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

  eventsRouter.get('/', restrictedViewOnly, (req, res) => {
    winston.log('info', 'GET /');
    db_facade.getEvents()
      .then(events => {
        res.json(events);
      });
  });

  eventsRouter.get('/:id', restrictedViewOnly, (req, res) => {
    let id = req.params.id;
    db_facade.getEvent(id)
      .then(event => {
        res.json(event);
      });
  });

  eventsRouter.post('/', restrictedBasic, (req, res) => {
    let body = req.body;
    db_facade.createEvent(body)
      .then(newEvent => {
        res.json(newEvent);
      });
  });

  eventsRouter.put('/:id', restrictedBasic, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let newDetailsEvent = ThingEvent.fromJSON(body);

    db_facade.updateEvent(newDetailsEvent)
    .then(changedRacer => {
      res.json(changedRacer);
    });
  });

  eventsRouter.delete('/:id', restrictedBasic, (req, res) => {
    let id = req.params.id;

    db_facade.deleteEvent(id)
      .then(() => res.send('ok'));
  })

  return eventsRouter;
}
