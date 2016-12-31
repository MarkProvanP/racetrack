import * as express from "express";
import { DbFacadeInterface } from "../db/db-facade";
import { Racer } from "../../common/racer";
import * as winston from "winston";
import { DataIntermediary } from "../data-intermediate";
import { restrictedViewOnly, restrictedBasic, restrictedModifyAll, restrictedSuperuser } from "../auth";

export default function racersRouterWithDb(dataIntermediate: DataIntermediary) {
  let racersRouter = express.Router();

  racersRouter.use((req, res, next) => {
    winston.log('verbose', 'Racers request');
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(401);
      res.send();
    }
  });

  racersRouter.get('/', restrictedViewOnly, (req, res) => {
    winston.log('verbose', 'GET /racers'); 
    dataIntermediate.getRacers()
      .then(racers => {
        res.type('application/json');
        res.send(JSON.stringify(racers));
      });
  })

  racersRouter.get('/:id', restrictedViewOnly, (req, res) => {
    let id = req.params.id;
    dataIntermediate.getRacer(id)
      .then(racer => {
        res.type('application/json');
        res.send(JSON.stringify(racer));
      });
  });

  racersRouter.post('/', restrictedModifyAll, (req, res) => {
    winston.log('verbose', 'POST /racers')
    let body = req.body;
    dataIntermediate.createRacer(body)
      .then(newRacer => {
        res.type('application/json');
        res.send(JSON.stringify(newRacer));
      })
  })

  racersRouter.put('/:id', restrictedModifyAll, (req, res) => {
    winston.log('verbose', 'PUT /racers')
    let body = req.body;
    winston.log('verbose', body);
    let newDetailsRacer = Racer.fromJSON(body);

    dataIntermediate.updateRacer(newDetailsRacer, req.user)
      .then(changedRacer => {
        res.type('application/json');
        res.send(JSON.stringify(changedRacer));
      });
  })

  racersRouter.delete('/:id', restrictedModifyAll, (req, res) => {
    winston.log('verbose', 'DELETE /racers');
    let body = req.body;
    let deletedRacerId = req.params.id;

    dataIntermediate.deleteRacer(deletedRacerId)
      .then(() => {
        res.send('successfully deleted racer');
      });
  })

  return racersRouter;
}

