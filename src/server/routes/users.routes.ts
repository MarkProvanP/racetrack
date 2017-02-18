import * as express from "express";
import * as winston from "winston";

import { NotFoundError } from "../errors";
import { DataIntermediary } from "../data-intermediate";
import { User, restrictedViewOnly, restrictedBasic, restrictedModifyAll, restrictedSuperuser } from "../auth";

export default function usersRouterWithDb(dataIntermediate: DataIntermediary) {
  let userDataRouter = express.Router();

  userDataRouter.use((req, res, next) => {
    winston.log('verbose', 'Users request');
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

  userDataRouter.get('/', restrictedViewOnly, (req, res) => {
    dataIntermediate.getUsers()
    .then(users => users.map(user => user.copyWithoutPassword()))
    .then(users => res.json(users))
    .catch(handleServerError(req, res));
  });

  userDataRouter.get('/:username', restrictedViewOnly, (req, res) => {
    let username = req.params.username;
    dataIntermediate.getUser(username)
    .then(user => res.json(user.copyWithoutPassword()))
    .catch(handleServerError(req, res))
  });

  userDataRouter.post('/', restrictedModifyAll, (req, res) => {
    let newUser = req.body;
    let username = newUser.username;
    if (username == 'admin') {
      res.status(403);
      res.send();
      return;
    }
    dataIntermediate.addUser(username, newUser)
    .then(newUser => res.json(newUser.copyWithoutPassword()))
    .catch(handleServerError(req, res));
  });

  userDataRouter.put('/:username', restrictedModifyAll, (req, res) => {
    let username = req.params.username;
    if (username == 'admin') {
      res.status(403);
      res.send();
      return;
    }
    let updatedUser = req.body;
    dataIntermediate.updateUser(updatedUser)
    .then(user => User.fromJSON(user))
    .then(user => user.copyWithoutPassword())
    .then(changedUser => res.json(changedUser))
    .catch(handleServerError(req, res));
  });

  userDataRouter.put('/:username/reset-password', restrictedModifyAll, (req, res) => {
    let username = req.params.username;
    if (username == 'admin') {
      res.status(403);
      res.send();
      return;
    }
    dataIntermediate.resetUserPassword(username)
    .then(user => User.fromJSON(user))
    .then(user => user.copyWithoutPassword())
    .then(changedUser => res.json(changedUser))
    .catch(handleServerError(req, res));
  });

  userDataRouter.delete('/:username', restrictedModifyAll, (req, res) => {
    let username = req.params.username;
    if (username == 'admin') {
      res.status(403);
      res.send();
      return;
    }
    dataIntermediate.deleteUser(username)
    .then(() => res.send('successfully deleted user'))
    .catch(handleServerError(req, res));
  });
  
  return userDataRouter;
}
