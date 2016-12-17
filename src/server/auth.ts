import * as express from "express";
import * as passport from "passport";
import * as localStrategy from "passport-local";


let LocalStrategy = localStrategy.Strategy;

import * as winston from "winston";
let router = express.Router();

import { DataIntermediary } from "./data-intermediate";
import { UserId, UserPrivileges, UserWithoutPassword, UserActionInfo } from "../common/user";
import { PhoneNumber } from '../common/text';

import * as bcrypt from "bcrypt-nodejs";

import { NoSuchUserError } from '../common/error';

const NO_USER_ERROR_CODE = 402;


export class User {
  username: UserId;
  password: string;
  name: string;
  email: string;
  phone: PhoneNumber;
  level: UserPrivileges;

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
    this.level = Number(properties.level);
  }

  copyWithoutPassword(): UserWithoutPassword {
    let copy = {} as UserWithoutPassword;
    copy.username = this.username;
    copy.name = this.name;
    copy.email = this.email;
    copy.phone = this.phone;
    copy.level = this.level;
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
      dataIntermediate.canAddUser(username)
        .then((can: boolean) => {
          if (!can) {
            done(`already have user with username: ${username}`);
            return Promise.resolve(null);
          } else {
            let properties = req.body;
            return dataIntermediate.addUser(username, password, properties)
          }
        })
        .then((user: User) => {
          if (user != null) {
            return done(null, user);
          }
        })
        .catch(err => {
          winston.info('Error registering user', {err});
          return done(err);
        })
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

  passport.serializeUser((user, done) => {
    done(null, user.username);
  });

  passport.deserializeUser((username, done) => {
    getPublicUser(username)
      .then(user => done(null, user));
  });

  router.post('/api/login', passport.authenticate('local'), (req, res) => {
    winston.log('info', '/api/login request');
    dataIntermediate.getUser(req.user.username)
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
    dataIntermediate.getUser(req.user.username)
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

  router.get('/api/auth', isLoggedIn, (req, res) => {
    res.json({auth: true})
  });

  router.get('/api/authenticated', isLoggedIn, (req, res) => {
    winston.log('info', '/api/authenticated request');
    dataIntermediate.getUser(req.user.username)
      .then(user => {
        res.json(user.copyWithoutPassword())
      })
      .catch(err => {
        winston.log('error','/api/authenticated error!', {err});
        if (err instanceof NoSuchUserError) {
          res.status(NO_USER_ERROR_CODE);
          res.send();
        } else {
          res.status(500);
          res.json({error: err})
        }
      })
  });

  let userDataRouter = express.Router();

  userDataRouter.use(isLoggedIn);

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

  userDataRouter.delete('/:username', (req, res) => {
    let username = req.params.username;
    dataIntermediate.deleteUser(username)
    .catch(err => res.status(500).send())
    .then(() => res.send('successfully deleted user'));
  });

  router.use('/users', userDataRouter);

  return router;
}
