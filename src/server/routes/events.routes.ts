import * as express from "express";
import { DbFacadeInterface } from '../db/db-facade';
import { ThingEvent } from "../../common/event";
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
    db_facade.getEvents()
      .then(events => {
        res.json(events);
      });
  });

  eventsRouter.get('/:id', (req, res) => {
    let id = req.params.id;
    db_facade.getEvent(id)
      .then(event => {
        res.json(event);
      });
  });

  eventsRouter.post('/', (req, res) => {
    let body = req.body;
    db_facade.createEvent(body)
      .then(newEvent => {
        res.json(newEvent);
      });
  });

  eventsRouter.put('/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let newDetailsEvent = ThingEvent.fromJSON(body);

    db_facade.updateEvent(newDetailsEvent)
    .then(changedRacer => {
      res.json(changedRacer);
    });
  });

  eventsRouter.delete('/:id', (req, res) => {
    let id = req.params.id;

    db_facade.deleteEvent(id)
      .then(() => res.send('ok'));
  })

  return eventsRouter;
}
