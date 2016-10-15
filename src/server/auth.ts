import * as express from "express";
import * as passport from "passport";
import * as localStrategy from "passport-local";
let LocalStrategy = localStrategy.Strategy;

import * as winston from "winston";
let router = express.Router();

import { PhoneNumber } from '../common/text';

import * as bcrypt from "bcrypt-nodejs";

import { NoSuchUserError } from '../common/error';

export interface UserWithoutPassword {
  username: string;
  name: string;
  email: string;
  phone: PhoneNumber;
}

const NO_USER_ERROR_CODE = 402;

export class User {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: PhoneNumber;

  validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }

  static createWithPassword(username, password, properties) {
    let salt = bcrypt.genSaltSync(10);
    let hashed = bcrypt.hashSync(password, salt);
    return new User(username, hashed, properties);
  }

  constructor(username: string, password: string, properties) {
    this.username = username;
    this.password = password;
    this.name = properties.name;
    this.email = properties.email;
    this.phone = properties.phone;
  }

  copyWithoutPassword(): UserWithoutPassword {
    let copy = {} as UserWithoutPassword;
    copy.username = this.username;
    copy.name = this.name;
    copy.email = this.email;
    copy.phone = this.phone;
    return copy;
  }

  static fromJSON(obj) {
    return new User(obj.username, obj.password, obj);
  }
}

export function AuthWithDbFacade(db_facade) {
  passport.use(new LocalStrategy((username, password, done) => {
    winston.log('info', `username: ${username} attempting login`);
    db_facade.getUser(username)
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
        if (err instanceof NoSuchUserError) {
          winston.log('info', `username: ${username} does not exist!`);
          return done(null, false, { message: 'Invalid username' });
        } else {
          winston.log('error','Error getting user!');
        }
      });
  }));

  passport.use('local-register', new LocalStrategy({passReqToCallback: true},
    (req, username, password, done) => {
      db_facade.canAddUser(username)
        .then(can => {
          if (!can) {
            return done(`already have user with username: ${username}`);
          } else {
            let properties = req.body;
            return db_facade.addUser(username, password, properties)
          }
        })
        .then(user => {
          return done(null, user);
        })
        .catch(err => {
          winston.info('Error registering user', {err});
          return done(err);
        })
    }));

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect("/r2bcknd/auth/login");
    }
  }

  function getPublicUser(username) {
    return db_facade.getUser(username)
      .then(user => user.copyWithoutPassword());
  }

  passport.serializeUser((user, done) => {
    done(null, user.username);
  });

  passport.deserializeUser((username, done) => {
    getPublicUser(username)
      .then(user => done(null, user));
  });

  router.post('/api/login', passport.authenticate('local'), (req, res) => {
    winston.log('info', '/api/login request');
    db_facade.getUser(req.user.username)
      .then(user => {
        res.json(user.copyWithoutPassword())
      })
      .catch(err => {
        winston.log('error','/api/login error!', {err});
        if (err instanceof NoSuchUserError) {
          res.status(NO_USER_ERROR_CODE);
          res.send();
        } else {
          res.status(500);
          res.json({error: err})
        }
      })
  });

  router.post('/api/register', passport.authenticate('local-register'), (req, res) => {
    winston.log('info', '/api/register request');
    db_facade.getUser(req.user.username)
      .then(user => {
        let withoutPassword = user.copyWithoutPassword();
        res.json(user.copyWithoutPassword());
      })
      .catch(err => {
        winston.log('error','/api/login error!', {err});
        res.status(500).send(err);
      });
  });

  router.get('/api/logout', isLoggedIn, (req, res) => {
    winston.log('info', '/api/logout request');
    req.session.destroy(err => {
      if (err) {
        res.status(500);
        res.json({status: 'error'});
      }
      res.json({status: 'logged out'});
    });
  });

  router.get('/api/authenticated', isLoggedIn, (req, res) => {
    winston.log('info', '/api/authenticated request');
    res.json({authenticated: true});
  });

  return router;
}
