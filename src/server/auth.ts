import * as express from "express";
import * as passport from "passport";
import * as localStrategy from "passport-local";
let LocalStrategy = localStrategy.Strategy;

let router = express.Router();

import * as bcrypt from "bcrypt-nodejs";

export class User {
  username: string;
  password: string;

  validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }

  static createWithPassword(username, password) {
    let salt = bcrypt.genSaltSync(10);
    let hashed = bcrypt.hashSync(password, salt);
    return new User(username, hashed);
  }

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  static fromJSON(obj) {
    return new User(obj.username, obj.password);
  }
}

export function AuthWithDbFacade(db_facade) {

  function getPublicUser(id) {
    return db_facade.getUser(id)
      .then(user => { return {username: user.username} })
  }

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

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect("/r2bcknd/auth/login");
    }
  }

  passport.serializeUser((user, done) => {
    console.log('serialising user', user);
    done(null, user.username);
  });

  passport.deserializeUser((id, done) => {
    console.log('deserialising user', id);
    getPublicUser(id)
      .then(user => done(null, user));
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

  passport.use('local-register', new LocalStrategy({passReqToCallback: true},
    (req, username, password, done) => {
      db_facade.canAddUser(username)
        .then(can => {
          if (!can) {
            return done(`already have user with username: ${username}`);
          } else {
            return db_facade.addUser(username, password)
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

  router.post('/login', passport.authenticate('local'),
    (req, res) => {
      res.redirect('/r2bcknd/auth/done');
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
