import * as express from "express";
import { DbFacadeInterface } from "../db/db-facade";
import { Racer } from "../../common/racer";
import * as winston from "winston";

export default function racersRouterWithDb(db_facade: DbFacadeInterface) {
  let racersRouter = express.Router();

  racersRouter.use(function(req, res, next) {
    winston.verbose('Racers request');
    next();
  });

  racersRouter.get('/', function(req, res) {
    winston.verbose('GET /racers'); 
    db_facade.getRacers()
      .then(racers => {
        res.type('application/json');
        res.send(JSON.stringify(racers));
      });
  })

  racersRouter.get('/:id', (req, res) => {
    let id = req.params.id;
    db_facade.getRacer(id)
      .then(racer => {
        res.type('application/json');
        res.send(JSON.stringify(racer));
      });
  });

  racersRouter.post('/', function(req, res) {
    winston.verbose('POST /racers')
    let body = req.body;
    db_facade.createRacer(body)
      .then(newRacer => {
        res.type('application/json');
        res.send(JSON.stringify(newRacer));
      })
  })

  racersRouter.put('/:id', function(req, res) {
    winston.verbose('PUT /racers')
    let body = req.body;
    winston.verbose(body);
    let newDetailsRacer = Racer.fromJSON(body);

    db_facade.updateRacer(req.params.id, newDetailsRacer)
      .then(changedRacer => {
        res.type('application/json');
        res.send(JSON.stringify(changedRacer));
      });
  })

  racersRouter.delete('/:id', function(req, res) {
    winston.verbose('DELETE /racers');
    let body = req.body;
    let deletedRacerId = req.params.id;

    db_facade.deleteRacer(deletedRacerId)
      .then(() => {
        res.send('successfully deleted racer');
      });
  })

  return racersRouter;
}

