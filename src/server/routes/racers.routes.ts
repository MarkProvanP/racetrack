import * as express from "express";

let racersRouter = express.Router();

import * as db_facade from "../db-facade";

import { Racer } from "../../common/racer";

racersRouter.use(function(req, res, next) {
  console.log('Racers request');
  next();
});

racersRouter.get('/', function(req, res) {
  console.log('GET /racers'); 
  db_facade.getRacers()
    .then(racers => {
      res.type('text/json');
      res.send(JSON.stringify(racers));
    });
})

racersRouter.post('/', function(req, res) {
  console.log('POST /racers')
  let body = req.body;
  console.log(req);
  console.log(body);
  let newRacerName = body.name;
  db_facade.createRacer(newRacerName)
    .then(newRacer => {
      res.type('application/json');
      res.send(JSON.stringify(newRacer));
    })
})

racersRouter.put('/:id', function(req, res) {
  console.log('PUT /racers')
  let body = req.body;
  console.log(body);
  let newDetailsRacer = body as Racer;

  db_facade.updateRacer(Number(req.params.id), newDetailsRacer)
    .then(changedRacer => {
      res.type('application/json');
      res.send(JSON.stringify(changedRacer));
    });
})

racersRouter.delete('/:id', function(req, res) {
  console.log('DELETE /racers');
  let body = req.body;
  console.log(body);
  let deletedRacerId = Number(req.params.id);

  db_facade.deleteRacer(deletedRacerId)
    .then(() => {
      res.end('successfully deleted racer');
    });
})

export default racersRouter;
