const HTTPS_FORCE = Boolean(process.env.HTTPS_FORCE);
const ON_HEROKU = process.env.NODE && ~process.env.NODE.indexOf("heroku");

import * as express from "express";
let app = express();

let forceSSL = require("express-force-ssl");
if (ON_HEROKU && HTTPS_FORCE) {
  console.log("Running on Heroku, requiring SSL")
  app.use(forceSSL);
  app.set('forceSSLOptions', {
    trustXFPHeader: true
  })
} else {
  console.log("Not running on Heroku, not requiring SSL");
}

import * as winston from "winston";
winston.add(winston.transports.File, { filename: 'logfile.log' })

let http = require('http').Server(app);
let io = require('socket.io')(http);
let passportSocketIo = require('passport.socketio');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let twilio = require('twilio');

const APP_NAME = process.env.APP_NAME;
const APP_URL = process.env.APP_URL;
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SENDING_NO = process.env.TWILIO_SENDING_NO;
const TWILIO_SMS_WEBHOOK = process.env.TWILIO_SMS_WEBHOOK;
const RACE2_ADMIN_PASSWORD = process.env.RACE2_ADMIN_PASSWORD;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const ERROR_EMAIL_RECIPIENTS = [GMAIL_USER].concat(process.env.ERROR_EMAIL_RECIPIENTS.split(","));
const STATUS_EMAIL_RECIPIENTS = [GMAIL_USER].concat(process.env.STATUS_EMAIL_RECIPIENTS.split(","));
const DATA_EMAIL_RECIPIENTS = [GMAIL_USER].concat(process.env.DATA_EMAIL_RECIPIENTS.split(","));
console.log(`Will send error emails to ${ERROR_EMAIL_RECIPIENTS}`);
console.log(`Will send status emails to ${STATUS_EMAIL_RECIPIENTS}`);
console.log(`Will send data emails to ${DATA_EMAIL_RECIPIENTS}`);
import { hostname } from "os";
const HOSTNAME = hostname();

const XOAUTH2_SETTINGS = {
  user: GMAIL_USER,
  clientId: GMAIL_CLIENT_ID,
  clientSecret: GMAIL_CLIENT_SECRET,
  refreshToken: GMAIL_REFRESH_TOKEN,
}
if (!RACE2_ADMIN_PASSWORD) {
  console.error("RACE2_ADMIN_PASSWORD environment variable must be set before use!");
  process.exit(1);
}

let twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

import { UserPrivileges, UserId } from "../common/user";
import { Racer } from '../common/racer';
import { Team } from '../common/team';
import { Text, TwilioInboundText, TwilioOutboundText } from "../common/text";
import { 
  AbstractMessage,
  TextReceivedMessage,
  TextSentMessage,
  TextUpdatedMessage,
  UserLoggedInMessage,
  UserLoggedOutMessage,
  OtherLoggedInUsersMessage,
  CLOSE_SOCKET
} from "../common/message";


var path = require('path');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(cookieParser());

// Let's Encrypt!
const ACME_CHALLENGES = process.env.ACME_CHALLENGES;
if (ACME_CHALLENGES) {
  let challenges = JSON.parse(ACME_CHALLENGES);
  challenges.forEach(({request, response}) => {
    app.get(request, (req, res) => {
      res.send(response);
    })
  });
}

const SESSION_SECRET = 'kewbfklebhfrhaewbfabfjbhzsfkjbkasjbvhkjaswbhdrvfkashbfvhavfha';
const SESSION_KEY = "express.sid";

import { UserWithoutPassword } from "../common/user";
import { AuthWithDataIntermediary } from "./auth";

import teamsRouterWithDb from "./routes/teams.routes";
import publicRouterWithDb from "./routes/public.routes";
import racersRouterWithDb from "./routes/racers.routes";
import textsRouterWithDb from "./routes/texts.routes";
import updatesRouterWithDb from "./routes/updates.routes";
import eventsRouterWithDb from "./routes/events.routes";
import usersRouterWithDb from "./routes/users.routes";
import miscRouterWithDb from "./routes/misc.routes";

import { SavedConfig, GetDataIntermediary } from "./data-intermediate";
import { DbFacadeInterface } from './db/db-facade';
import { setup } from './db/mongo-db-facade';

function onAuthorizeSuccess(data, accept) {
  console.log('successful connection to socket.io');
  accept();
}

function onAuthorizeFail(data, message, error, accept) {
  console.log('failed connection to socket.io', message);
  accept(new Error("not allowed!"));
}

let dataIntermediate;

import * as nodemailer from "nodemailer";
let xoauth2 = require("xoauth2");

import * as pug from "pug";
const EMAIL_TEMPLATES = {
  userCreated: pug.compileFile("src/email-templates/user-created.pug"),
  passwordReset: pug.compileFile("src/email-templates/password-reset.pug"),
  unhandledRejection: pug.compileFile("src/email-templates/unhandled-rejection.pug"),
  uncaughtException: pug.compileFile("src/email-templates/uncaught-exception.pug"),
  textSent: pug.compileFile("src/email-templates/text-sent.pug"),
  textReceived: pug.compileFile("src/email-templates/text-received.pug"),
  serverStarted: pug.compileFile("src/email-templates/server-started.pug")
}

export class Emailer {
  private smtpTransport;

  constructor(xoauth2Settings) {
    this.smtpTransport = nodemailer.createTransport({
      service: "Gmail",
      auth: xoauth2Settings
    })

    this.smtpTransport.verify((err, success) => {
      if (err) {
        console.error('Error with SMTP transport!', err)
      } else {
        console.log('SMTP transport ready!')
      }
    })
  }

  sendEmail(to: string[] | string, subject: string, bodyHtml: string) {
    let mailOptions = {
      from: {
        name: APP_NAME,
        address: GMAIL_USER
      },
      to: to,
      subject: subject,
      generateTextFromHTML: true,
      html: bodyHtml
    };
    return new Promise((resolve, reject) => {
      this.smtpTransport.sendMail(mailOptions, (err, res) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(res);
          resolve(res);
        }
      })
    });
  }

  sendUserCreatedEmail(user: UserWithoutPassword, password: string) {
    let emailHTMLString = EMAIL_TEMPLATES.userCreated({
      APP_NAME: APP_NAME,
      USER_NAME: user.name,
      USER_USERNAME: user.username,
      APP_URL: APP_URL,
      USER_PASSWORD: password
    })
    return this.sendEmail(
      user.email,
      `Welcome to ${APP_NAME}, ${user.name}`,
      emailHTMLString
    )
  }

  sendPasswordResetEmail(to: string, password: string) {
    let emailHTMLString = EMAIL_TEMPLATES.passwordReset({
      APP_NAME: APP_NAME,
      APP_URL: APP_URL,
      PASSWORD: password
    })
    return this.sendEmail(
      to,
      `${APP_NAME} Password Reset`,
      emailHTMLString
    )
  }

  sendUnhandledRejectionEmail(reason, promise) {
    let stacktrace = newlineReplace(String(reason.stack));
    let promiseString = newlineReplace(String(promise));
    let emailHTMLString = EMAIL_TEMPLATES.unhandledRejection({
      APP_NAME: APP_NAME,
      DATE: new Date(),
      PROMISE_STRING: promiseString,
      STACKTRACE: stacktrace,
      HOSTNAME: HOSTNAME
    })
    return this.sendEmail(
      ERROR_EMAIL_RECIPIENTS,
      `${APP_NAME} - Unhandled rejection!`,
      emailHTMLString
    )
  }

  sendUncaughtExceptionEmail(exception) {
    let stacktrace = newlineReplace(exception.stack);
    let emailHTMLString = EMAIL_TEMPLATES.uncaughtException({
      APP_NAME: APP_NAME,
      DATE: new Date(),
      STACKTRACE: stacktrace,
      HOSTNAME: HOSTNAME
    })
    return this.sendEmail(
      ERROR_EMAIL_RECIPIENTS,
      `${APP_NAME} - Uncaught Exception!`,
      emailHTMLString
    )
  }

  sendTextSentEmail(text: TwilioOutboundText) {
    let emailHTMLString = EMAIL_TEMPLATES.textSent({
      APP_NAME: APP_NAME,
      TEXT_RECIPIENT: text.to,
      TEXT_BODY: text.body
    })
    return this.sendEmail(
      DATA_EMAIL_RECIPIENTS,
      `${APP_NAME} - Text sent to ${text.to}`,
      emailHTMLString
    )
  }

  sendTextReceivedEmail(text: TwilioInboundText) {
    let emailHTMLString = EMAIL_TEMPLATES.textReceived({
      APP_NAME: APP_NAME,
      TEXT_SENDER: text.From,
      TEXT_BODY: text.Body
    })
    return this.sendEmail(
      DATA_EMAIL_RECIPIENTS,
      `${APP_NAME} - Text Received from ${text.From}`,
      emailHTMLString
    )
  }
  
  sendServerStartedEmail() {
    let emailHTMLString = EMAIL_TEMPLATES.serverStarted({
      APP_NAME: APP_NAME,
      DATE: new Date(),
      HOSTNAME: HOSTNAME
    })
    return this.sendEmail(
      STATUS_EMAIL_RECIPIENTS,
      "Server started!",
      emailHTMLString
    )
  }
}
let emailer = new Emailer(XOAUTH2_SETTINGS);

let newlineReplace = (str) => str.replace(/(?:\r\n|\r|\n)/g, '<br />');
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection!', reason, promise);
  emailer.sendUnhandledRejectionEmail(reason, promise)
  .catch(err => {
    console.error('Oh noes! An error occured while trying to handle an error! This is absolutely awful!')
    console.error('New error', err);
  });
});

process.on('uncaughtException', (exception) => {
  console.error('Uncaught exception!', exception);
  emailer.sendUncaughtExceptionEmail(exception)
  .catch(err => {
    console.error('Oh noes! An error occured while trying to handle an error! This is absolutely awful!')
    console.error('New error', err);
  });
});

export class MessageSender {
  sockets = [];

  constructor() {

  }

  addClient(socket) {
    this.sockets.push(socket);
  }

  removeClient(socket) {
    let index = this.sockets.indexOf(socket);
    if (index > -1) {
      this.sockets.splice(index, 1);
    }
  }

  sendMessageToWebClients(message: AbstractMessage, excluded?) {
    let event = message.getEvent();
    console.log('sending message to web clients', message);
    this.sockets.forEach(socket => {
      if (socket != excluded) {
        socket.emit(event, message);
      } else {
        console.log('excluding socket');
      }
    });
  }
}

let messageSender = new MessageSender();

//let db_facade : DbFacadeInterface = new InMemoryDbFacade();
setup(MONGODB_URI)
  .then(db_facade => {
    winston.info('MongoDB now ready for use');

    dataIntermediate = GetDataIntermediary(db_facade, messageSender, emailer);


    // Check to see if the admin user has been created yet. If not, create it.
    dataIntermediate.canAddUser('admin')
    .then(can => {
      if (!can) return;
      winston.info(`Creating admin user with password: ${RACE2_ADMIN_PASSWORD}`);
      dataIntermediate.addUserWithPassword('admin', RACE2_ADMIN_PASSWORD, {
        name: "Administrator",
        email: GMAIL_USER,
        phone: "",
        level: UserPrivileges.SUPERUSER
      })
    });

    let mongoSessionStore = new MongoStore({
      db: db_facade.db,
      autoReconnect: true
    });
    
    app.use(expressSession({
      secret: SESSION_SECRET,
      key: SESSION_KEY,
      resave: true,
      saveUninitialized: true,
      store: mongoSessionStore
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    io.use(passportSocketIo.authorize({
      cookieParser: cookieParser,
      key: SESSION_KEY,
      secret: SESSION_SECRET,
      store: mongoSessionStore,
      success: onAuthorizeSuccess,
      fail: onAuthorizeFail
    }));

    io.on('connection', function(socket) {
      let socketUser = socket.request.user;
      winston.log('info', `Socket.io connection from web client started, username: ${socketUser.name}`);
      console.log('Users now', messageSender.sockets.map(client => client.request.user));

      let userLoggedInMessage = new UserLoggedInMessage(socketUser);
      messageSender.sendMessageToWebClients(userLoggedInMessage, socket);

      let otherLoggedInUsers = messageSender.sockets.map(client => client.request.user);
      let otherLoggedInUsersMessage = new OtherLoggedInUsersMessage(otherLoggedInUsers);
      socket.emit(OtherLoggedInUsersMessage.event, otherLoggedInUsersMessage);

      messageSender.addClient(socket);

      socket.on(CLOSE_SOCKET, () => {
        socket.disconnect();
      });

      socket.on('disconnect', function() {
        winston.log('info', 'Socket.io connection from web client ended');
        messageSender.removeClient(socket);
        console.log('Users now', messageSender.sockets.map(client => client.request.user));

        let userLoggedOutMessage = new UserLoggedOutMessage(socketUser);
        messageSender.sendMessageToWebClients(userLoggedOutMessage, socket);
      });
    });

    let apiRouter = express.Router();

    let authRouter = AuthWithDataIntermediary(dataIntermediate);
    apiRouter.use('/auth', authRouter);

    let teamsRouter = teamsRouterWithDb(dataIntermediate);
    apiRouter.use('/teams', teamsRouter);

    let racersRouter = racersRouterWithDb(dataIntermediate);
    apiRouter.use("/racers", racersRouter);

    let twilioObj = {
      client: twilioClient,
      fromNumber: TWILIO_SENDING_NO
    }
    let textsRouter = textsRouterWithDb(dataIntermediate, twilioObj, TWILIO_SID, TWILIO_AUTH_TOKEN);
    apiRouter.use("/texts", textsRouter);

    let updatesRouter = updatesRouterWithDb(dataIntermediate);
    apiRouter.use("/updates", updatesRouter);

    let eventsRouter = eventsRouterWithDb(db_facade);
    apiRouter.use('/events', eventsRouter);

    let usersRouter = usersRouterWithDb(dataIntermediate);
    apiRouter.use('/users', usersRouter);

    let publicRouter = publicRouterWithDb(dataIntermediate);
    apiRouter.use('/public', publicRouter);

    let miscRouter = miscRouterWithDb(dataIntermediate);
    apiRouter.use('/misc', miscRouter);

    apiRouter.post("/email", (req, res) => {
      let mailOptions = req.body;
      emailer.sendEmail(
        mailOptions.to,
        mailOptions.subject,
        mailOptions.html
      )
      .then(messageInfo => {
        console.log(messageInfo);
        res.send(messageInfo);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send(err);
      })
    })

    http.listen(PORT, function() {
      winston.info(`App now listening on port: ${PORT}`);
    });

    app.post('/twiml', function(req, res) {
      if (twilio.validateExpressRequest(req, TWILIO_AUTH_TOKEN, {url: TWILIO_SMS_WEBHOOK})) {
        let text = req.body;
        winston.log('verbose', `Received text from Twilio`, {text});
        dataIntermediate.addNewReceivedText(text)
        .then(success => {
          let response = new twilio.TwimlResponse();
          res.send(response.toString());
        })
        .catch(err => {
          winston.error('Could not add inbound Twilio text to database!', {text, err});
          res.status(500).send(err);
        });
      } else {
        winston.warn('Invalid Twilio request received!');
        res.status(403).send("Error, you're not twilio!");
      }
    });

    app.use('/r2bcknd', apiRouter);
    /*
     * When a social media crawler bot reaches the server we want it to be presented with
     * static info, not the normal Angular frontend. This will mean that links to the app
     * shared on social media will look nice and fancy and specific to that URL (e.g.
     * having the team name in the description when linking to the tracking page for that
     * team)
     */
    function socialMediaBotMiddleware(req, res, next) {
      let userAgent = req.get('User-Agent');

      let facebook = (ua) => ua.includes("Facebot") || ua.includes("facebookexternalhit");
      let twitter = (ua) => ua.includes("Twitterbot")

      let isFacebook = facebook(userAgent);
      let isTwitter = twitter(userAgent);
      
      if (!isFacebook && !isTwitter) {
        // If neither, then move on as normal!
        return next();
      }

      console.log('Received request from Facebook or Twitter social media bot!');

      /*
       * Now we know it's a bot, we can look at the request to see what data it wants and
       * then get it from the database, so that it can be included in the response
       */

      let originalURL = req.originalUrl;

      /*
       * There are two public pages specified:
       *
       * 1. '/' - Just the normal public map view
       *
       * 2. '/track/TEAM_NUMBER' - For tracking a specific team
       *
       */

      function createResponseHTML(data) {
        return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta property="og:title" content="${data.title}" />
                <meta property="og:description" content="${data.description}" />
                <meta property="og:image" content="${data.image}" />
            </head>
            <body>
                <h1>You look like a bot</h1>
                <p>You're seeing this page because your browser's User Agent is detected as being
                the Facebook or Twitter crawler bot.</p>
                <p>These bots have been presented with this information</p>
                <table>
                <tr>
                  <th>og:title</th>
                  <td>${data.title}</td>
                </tr>
                <tr>
                  <th>og:description</th>
                  <td>${data.description}</td>
                </tr>
                <tr>
                  <th>og:image</th>
                  <td>
                    <p>${data.image}</p>
                    <img src='${data.image}'>
                  </td>
                </tr>
                </table>
            </body>
        </html>
        `
      }

      const basicData = {
        title: APP_NAME,
        description: "Keep track of all the teams as they hitchhike for charity!",
        image: APP_URL + "assets/img/race2_prague.jpg"
      }

      let match
      console.log('original URL', originalURL)
      if (match = originalURL.match(/^\/track\/(\w*)$/)) {
        // Team tracker
        let teamId = match[1];
        dataIntermediate.getTeam(teamId)
        .then(team => team.stripPrivateData())
        .then(publicTeam => {
          let data = JSON.parse(JSON.stringify(basicData));
          data.title = `Track ${publicTeam.getPrettyRacersList()} as they hitchhike for charity!`;
          if (publicTeam.affiliation) {
            data.description = `${publicTeam.name} are affiliated to ${publicTeam.affiliation}`
          } else {
            data.description = `${publicTeam.name}`
          }
          let generatedHTML = createResponseHTML(data);
          res.send(generatedHTML);
        })
        .catch(err => {
          let generatedHTML = createResponseHTML(basicData);
          res.send(generatedHTML);
        })
      } else {
        // No need for special treatment, send the standard response
        let generatedHTML = createResponseHTML(basicData);
        res.send(generatedHTML);
      }
    }

    app.use(socialMediaBotMiddleware);
    app.use(express.static('dist'));
    app.get('/*', (req, res) => {
      res.sendFile('index.html', { root: 'dist' })
    })

}).catch(err => {
  console.error('error setting up server', err);
});
