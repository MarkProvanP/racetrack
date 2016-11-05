import * as express from "express";
import { DbFacadeInterface } from "../db/db-facade";
import { Racer } from "../../common/racer";
import * as winston from "winston";
import { DataIntermediary } from "../data-intermediate";

export default function racersRouterWithDb(dataIntermediary: DataIntermediary) {
  let racersRouter = express.Router();

  racersRouter.use(function(req, res, next) {
    winston.log('verbose', 'Racers request');
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(401);
      res.send();
    }
  });

  racersRouter.get('/', function(req, res) {
    winston.log('verbose', 'GET /racers'); 
    dataIntermediary.getRacers()
      .then(racers => {
        res.type('application/json');
        res.send(JSON.stringify(racers));
      });
  })

  racersRouter.get('/:id', (req, res) => {
    let id = req.params.id;
    dataIntermediary.getRacer(id)
      .then(racer => {
        res.type('application/json');
        res.send(JSON.stringify(racer));
      });
  });

  racersRouter.post('/', function(req, res) {
    winston.log('verbose', 'POST /racers')
    let body = req.body;
    dataIntermediary.createRacer(body)
      .then(newRacer => {
        res.type('application/json');
        res.send(JSON.stringify(newRacer));
      })
  })

  racersRouter.put('/:id', function(req, res) {
    winston.log('verbose', 'PUT /racers')
    let body = req.body;
    winston.log('verbose', body);
    let newDetailsRacer = Racer.fromJSON(body);

    dataIntermediary.updateRacer(newDetailsRacer, req.user)
      .then(changedRacer => {
        res.type('application/json');
        res.send(JSON.stringify(changedRacer));
      });
  })

  racersRouter.delete('/:id', function(req, res) {
    winston.log('verbose', 'DELETE /racers');
    let body = req.body;
    let deletedRacerId = req.params.id;

    dataIntermediary.deleteRacer(deletedRacerId)
      .then(() => {
        res.send('successfully deleted racer');
      });
  })

  return racersRouter;
}

