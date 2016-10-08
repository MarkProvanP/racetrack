import * as express from "express";
import * as passport from "passport";
import * as localStrategy from "passport-local";
let LocalStrategy = localStrategy.Strategy;

let router = express.Router();

import { PhoneNumber } from '../common/text';

import * as bcrypt from "bcrypt-nodejs";

export interface UserWithoutPassword {
  username: string;
  name: string;
  email: string;
  phone: PhoneNumber;
}

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
    console.log('copyWithoutPassword', this);
    let copy = {} as UserWithoutPassword;
    copy.username = this.username;
    copy.name = this.name;
    copy.email = this.email;
    copy.phone = this.phone;
    console.log('copy is', copy);
    return copy;
  }

  static fromJSON(obj) {
    return new User(obj.username, obj.password, obj);
  }
}

export function AuthWithDbFacade(db_facade) {
  passport.use(new LocalStrategy((username, password, done) => {
    db_facade.getUser(username)
      .then(user => {
        if (user) {
          return done(null, user);
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: 'incorrect password' });
        }
        return done(null, user);
      })
      .catch(err => {
        return done(err);
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
            console.log(`creating user with username: ${username}, password: ${password}, properties: ${properties}`);
            return db_facade.addUser(username, password, properties)
          }
        })
        .then(user => {
          return done(null, user);
        })
        .catch(err => {
          console.log('local-register error', err);
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
    console.log('serialising user', user);
    done(null, user.username);
  });

  passport.deserializeUser((username, done) => {
    console.log('deserialising user', username);
    getPublicUser(username)
      .then(user => done(null, user));
  });

  router.post('/api/login', passport.authenticate('local'), (req, res) => {
    console.log('logging in user', req.user);
    db_facade.getUser(req.user.username)
      .then(user => {
        res.json(user.copyWithoutPassword())
      })
      .catch(err => {
        res.status(500);
        res.json({error: err})
      })
  });

  router.post('/api/register', passport.authenticate('local-register'), (req, res) => {
    console.log('registering user', req.user);
    db_facade.getUser(req.user.username)
      .then(user => {
        console.log('got user', user);
        let withoutPassword = user.copyWithoutPassword();
        console.log('without password', withoutPassword);
        res.json(user.copyWithoutPassword());
        console.log('sent response');
      })
      .catch(err => {
        console.log('error!', err);
        res.status(500).send(err);
      });
  });

  router.get('/api/logout', isLoggedIn, (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.log('logout error!', err);                    
        res.json({status: 'error'});
      }
      res.json({status: 'logged out'});
    });
  });

  router.get('/api/authenticated', isLoggedIn, (req, res) => {
    res.json({authenticated: true});
  });

  router.get('/login', (req, res) => {
    let html = `
    <!DOCTYPE html>
    <head><title>Login</title></head>
    <body>
      <h1>Login</h1>
      <form method='post'>
        <label>Username<input name='username' type='text' required></label>
        <label>Password<input name='password' type='password' required></label>
        <button type='submit'>Login</button>
        <a href='/r2bcknd/auth/register'>Register</a>
      </form>
    </body>
    </html>
    `;
    res.type('text/html');
    res.send(html);
  });
  router.post('/login', passport.authenticate('local'),
    (req, res) => {
      res.redirect('/r2bcknd/auth/done');
    });


  router.post('/register', passport.authenticate('local-register', {
    successRedirect: '/r2bcknd/auth/done',
    failureRedirect: '/r2bcknd/auth/register'
  }));

  router.get('/register', (req, res) => {
    let html = `
    <!DOCTYPE html>
    <head><title>Register</title></head>
    <body>
      <h1>Register</h1>
      <form method='post'>
        <label>Username<input name='username' type='text' required></label>
        <label>Password<input name='password' type='password' required></label>
        <button type='submit'>Register</button>
      </form>
    </body>
    </html>
    `;
    res.type('text/html');
    res.send(html);
  });



  router.get('/logout', isLoggedIn, (req, res) => {
    req.session.destroy(err => {
      let html = `
      <!DOCTYPE html>
      <head><title>Logged out!</title></head>
      <body>
        <h1>Logged out!</h1>
      </body>
      </html>
      `;
      res.type('text/html');
      res.send(html);
    });
  });



  router.get('/done', isLoggedIn, (req, res) => {
    let html = `
    <!DOCTYPE html>
    <head><title>Done!</title></head>
    <body>
      <h1>Private data!</h1>
      <a href='/r2bcknd/auth/logout'>Log Out</a>
    </body>
    </html>
    `;
    res.type('text/html');
    res.send(html);
  });

  return router;
}
