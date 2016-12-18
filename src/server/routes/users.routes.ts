import * as express from "express";
import * as winston from "winston";

import { DataIntermediary } from "../data-intermediate";
import { User } from "../auth";

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

  userDataRouter.get('/', (req, res) => {
    dataIntermediate.getUsers()
    .catch(err => res.status(500).send())
    .then(users => users.map(user => user.copyWithoutPassword()))
    .then(users => res.json(users));
  });

  userDataRouter.get('/:username', (req, res) => {
    let username = req.params.username;
    dataIntermediate.getUser(username)
    .catch(err => res.status(500).send())
    .then(user => user.copyWithoutPassword())
    .then(user => res.json(user));
  });

  userDataRouter.post('/', (req, res) => {
    let newUser = req.body;
    let username = newUser.username;
    let password = newUser.password;
    dataIntermediate.addUser(username, password, newUser)
    .catch(err => res.status(500).send())
    .then(newUser => res.json(newUser.copyWithoutPassword()));
  });

  userDataRouter.put('/:username', (req, res) => {
    let username = req.params.username;
    let updatedUser = req.body;
    dataIntermediate.updateUser(updatedUser)
    .catch(err => res.status(500).send())
    .then(user => User.fromJSON(user))
    .then(user => user.copyWithoutPassword())
    .then(changedUser => res.json(changedUser));
  });

  userDataRouter.put('/:username/change-password', (req, res) => {
    let username = req.params.username;
    let newPassword = req.body.password;
    dataIntermediate.changeUserPassword(username, newPassword)
    .catch(err => res.status(500).send())
    .then(user => User.fromJSON(user))
    .then(user => user.copyWithoutPassword())
    .then(changedUser => res.json(changedUser));
  });

  userDataRouter.delete('/:username', (req, res) => {
    let username = req.params.username;
    dataIntermediate.deleteUser(username)
    .catch(err => res.status(500).send())
    .then(() => res.send('successfully deleted user'));
  });
  
  return userDataRouter;
}
