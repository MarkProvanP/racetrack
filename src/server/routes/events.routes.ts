import * as express from "express";
import { DbFacadeInterface } from '../db/db-facade';
import { ThingEvent } from "../../common/event";
import * as winston from "winston";
import { NotFoundError } from "../errors";
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

  eventsRouter.get('/', restrictedViewOnly, (req, res) => {
    winston.log('info', 'GET /');
    db_facade.getEvents()
    .then(events => res.json(events))
    .catch(handleServerError(req, res))
  });

  eventsRouter.get('/:id', restrictedViewOnly, (req, res) => {
    let id = req.params.id;
    db_facade.getEvent(id)
    .then(event => res.json(event))
    .catch(handleServerError(req, res))
  });

  eventsRouter.post('/', restrictedBasic, (req, res) => {
    let body = req.body;
    db_facade.createEvent(body)
    .then(newEvent => res.json(newEvent))
    .catch(handleServerError(req, res))
  });

  eventsRouter.put('/:id', restrictedBasic, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let newDetailsEvent = ThingEvent.fromJSON(body);

    db_facade.updateEvent(newDetailsEvent)
    .then(changedRacer => res.json(changedRacer))
    .catch(handleServerError(req, res))
  });

  eventsRouter.delete('/:id', restrictedBasic, (req, res) => {
    let id = req.params.id;

    db_facade.deleteEvent(id)
    .then(() => res.send())
    .catch(handleServerError(req, res))
  })

  return eventsRouter;
}
