import * as express from "express";
import { DbFacadeInterface } from "../db/db-facade";
import { Racer } from "../../common/racer";

export default function racersRouterWithDb(db_facade: DbFacadeInterface) {
  let racersRouter = express.Router();

  racersRouter.use(function(req, res, next) {
    console.log('Racers request');
    next();
  });

  racersRouter.get('/', function(req, res) {
    console.log('GET /racers'); 
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
    console.log('POST /racers')
    let body = req.body;
    db_facade.createRacer(body)
      .then(newRacer => {
        res.type('application/json');
        res.send(JSON.stringify(newRacer));
      })
  })

  racersRouter.put('/:id', function(req, res) {
    console.log('PUT /racers')
    let body = req.body;
    console.log(body);
    let newDetailsRacer = Racer.fromJSON(body);

    db_facade.updateRacer(req.params.id, newDetailsRacer)
      .then(changedRacer => {
        res.type('application/json');
        res.send(JSON.stringify(changedRacer));
      });
  })

  racersRouter.delete('/:id', function(req, res) {
    console.log('DELETE /racers');
    let body = req.body;
    console.log(body);
    let deletedRacerId = req.params.id;

    db_facade.deleteRacer(deletedRacerId)
      .then(() => {
        res.send('successfully deleted racer');
      });
  })

  return racersRouter;
}

