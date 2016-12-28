import * as express from "express";
import * as winston from "winston";

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

  userDataRouter.get('/', restrictedViewOnly, (req, res) => {
    dataIntermediate.getUsers()
    .catch(err => res.status(500).send())
    .then(users => users.map(user => user.copyWithoutPassword()))
    .then(users => res.json(users));
  });

  userDataRouter.get('/:username', restrictedViewOnly, (req, res) => {
    let username = req.params.username;
    dataIntermediate.getUser(username)
    .catch(err => res.status(500).send())
    .then(user => user.copyWithoutPassword())
    .then(user => res.json(user));
  });

  userDataRouter.post('/', restrictedModifyAll, (req, res) => {
    let newUser = req.body;
    let username = newUser.username;
    if (username == 'admin') {
      res.status(403);
      res.send();
      return;
    }
    let password = newUser.password;
    dataIntermediate.addUser(username, password, newUser)
    .catch(err => res.status(500).send())
    .then(newUser => res.json(newUser.copyWithoutPassword()));
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
    .catch(err => res.status(500).send())
    .then(user => User.fromJSON(user))
    .then(user => user.copyWithoutPassword())
    .then(changedUser => res.json(changedUser));
  });

  userDataRouter.put('/:username/reset-password', restrictedModifyAll, (req, res) => {
    let username = req.params.username;
    if (username == 'admin') {
      res.status(403);
      res.send();
      return;
    }
    dataIntermediate.resetUserPassword(username)
    .catch(err => res.status(500).send())
    .then(user => User.fromJSON(user))
    .then(user => user.copyWithoutPassword())
    .then(changedUser => res.json(changedUser));
  });

  userDataRouter.delete('/:username', restrictedModifyAll, (req, res) => {
    let username = req.params.username;
    if (username == 'admin') {
      res.status(403);
      res.send();
      return;
    }
    dataIntermediate.deleteUser(username)
    .catch(err => res.status(500).send())
    .then(() => res.send('successfully deleted user'));
  });
  
  return userDataRouter;
}
