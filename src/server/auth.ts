import * as express from "express";
import * as passport from "passport";
import * as localStrategy from "passport-local";


let LocalStrategy = localStrategy.Strategy;

import * as winston from "winston";
let router = express.Router();

import { NotFoundError } from "./errors";
import { DataIntermediary } from "./data-intermediate";
import { UserId, UserPrivileges, isAboveMinimumPrivilege, UserWithoutPassword, UserActionInfo } from "../common/user";
import { PhoneNumber } from '../common/text';

import * as bcrypt from "bcrypt-nodejs";

const NO_USER_ERROR_CODE = 402;

function restrictedLevel(level) {
  return (req, res, next) => {
    let user = req.user;
    let check = isAboveMinimumPrivilege(level);
    if (check(user.level)) {
      next();
    } else {
      res.status(403);
      res.send();
    }
  }
}

export let restrictedViewOnly = restrictedLevel(UserPrivileges.VIEW_ONLY);
export let restrictedBasic = restrictedLevel(UserPrivileges.BASIC);
export let restrictedModifyAll = restrictedLevel(UserPrivileges.MODIFY_ALL);
export let restrictedSuperuser = restrictedLevel(UserPrivileges.SUPERUSER);

export class User {
  // Fields kept only for server use
  password: string;
  recentlyReset: boolean;

  // Fields that are given to the frontend
  username: UserId;
  name: string;
  email: string;
  phone: PhoneNumber;
  level: UserPrivileges;
  role: string;

  validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }

  static createWithPassword(username, password, properties) {
    let salt = bcrypt.genSaltSync(10);
    let hashed = bcrypt.hashSync(password, salt);
    return new User(username, hashed, properties);
  }

  makeClone() {
    let clone = JSON.parse(JSON.stringify(this));
    let username = clone.username;
    let password = clone.password;
    return new User(username, password, clone);
  }

  changePassword(newPassword: string, isReset?: boolean) {
    this.recentlyReset = !!isReset;
    let clone = this.makeClone();
    let salt = bcrypt.genSaltSync(10);
    let hashed = bcrypt.hashSync(newPassword, salt);
    clone.password = hashed;
    return clone;
  }

  constructor(username: string, password: string, properties) {
    this.password = password;
    this.recentlyReset = !!properties.recentlyReset;

    this.username = username;
    this.name = properties.name;
    this.email = properties.email;
    this.phone = properties.phone;
    this.level = Number(properties.level);
    this.role = properties.role;
  }

  copyWithoutPassword(): UserWithoutPassword {
    let copy = {} as UserWithoutPassword;
    copy.username = this.username;
    copy.name = this.name;
    copy.email = this.email;
    copy.phone = this.phone;
    copy.level = this.level;
    copy.role = this.role;
    return copy;
  }

  static fromJSON(obj) {
    return new User(obj.username, obj.password, obj);
  }
}

export function AuthWithDataIntermediary(dataIntermediate: DataIntermediary) {
  passport.use(new LocalStrategy((username, password, done) => {
    winston.log('info', `username: ${username} attempting login`);
    dataIntermediate.getUser(username)
      .then(user => {
        winston.log('info', `username: ${username} exists`);
        if (!user.validPassword(password)) {
          winston.log('info', `username: ${username} provided incorrect password!`);
          return done(null, false, { message: 'Incorrect password' });
        }
        winston.log('info', `username: ${username} successfully logged in`)
        return done(null, user);
      })
      .catch(err => {
        if (err instanceof NotFoundError) {
          winston.log('info', `username: ${username} does not exist!`);
          return done(null, false, { message: 'Invalid username' });
        } else {
          winston.log('error','Error getting user!');
        }
      });
  }));

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.json({auth: false});
    }
  }

  function getPublicUser(username) {
    return dataIntermediate.getUser(username)
      .then(user => user.copyWithoutPassword());
  }

  passport.serializeUser((user: User, done) => {
    try {
      done(null, user.username);
    } catch (err) {
      done(err, null);
    }
  });

  passport.deserializeUser((username, done) => {
    getPublicUser(username)
    .then(user => done(null, user))
    .catch(err => done(err, null));
  });

  function handleServerError(req, res) {
    return (err) => {
      if (err instanceof NotFoundError) {
        res.status(404).send(err.toString());
      } else {
        console.error('auth.ts error', err);
        res.status(500).send();
      }
    }
  }

  router.post('/api/login', passport.authenticate('local'), (req, res) => {
    winston.log('info', '/api/login request');
    dataIntermediate.getUser(req.user.username)
    .then(user => {
      res.json(user.copyWithoutPassword())
    })
    .catch(handleServerError(req, res))
  });

  router.get('/api/logout', isLoggedIn, (req, res) => {
    winston.log('info', '/api/logout request');
    req.logOut()
    res.json({status: 'logged out'})
  });

  router.put('/api/change-password', isLoggedIn, (req, res) => {
    winston.log('info', '/api/change-password request');
    let username = req.user.username;
    if (username == 'admin') {
      res.status(403);
      res.send();
      return;
    }
    let newPassword = req.body.password;
    dataIntermediate.changeUserPassword(username, newPassword)
    .then(user => User.fromJSON(user))
    .then(user => user.copyWithoutPassword())
    .then(changedUser => res.json(changedUser))
    .catch(handleServerError(req, res))
  });

  router.get('/api/auth', isLoggedIn, (req, res) => {
    let username = req.user.username;
    dataIntermediate.getUser(username)
    .then(user => {
      res.json({
        auth: true,
        resetPassword: user.recentlyReset
      });
    })
    .catch(handleServerError(req, res))
  });

  router.get('/api/authenticated', isLoggedIn, (req, res) => {
    winston.log('info', '/api/authenticated request');
    dataIntermediate.getUser(req.user.username)
    .then(user => res.json(user.copyWithoutPassword()))
    .catch(handleServerError(req, res))
  });

  return router;
}
