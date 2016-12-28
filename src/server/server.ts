"use strict";
import * as express from "express";
var app = express();

const APP_NAME = "Race2App";
const APP_URL = "http://www.race2.org.uk/"

app.use(express.static('dist'));

import * as winston from "winston";
winston.add(winston.transports.File, { filename: 'logfile.log' })

var http = require('http').Server(app);

var io = require('socket.io')(http);
let passportSocketIo = require('passport.socketio');
var bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

import * as config from '../../app-config';

var twilio = require('twilio');

const PORT = process.env.PORT || config.SERVER_PORT;
const MONGODB_URI = process.env.MONGODB_URI || config.db_url;
const TWILIO_SID = process.env.TWILIO_SID || config.accountSid;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || config.authToken;
const TWILIO_SENDING_NO = process.env.TWILIO_SENDING_NO || config.sendingNo;
const TWILIO_SMS_WEBHOOK = process.env.TWILIO_SMS_WEBHOOK || config.twilioSMSWebHook;
const RACE2_ADMIN_PASSWORD = process.env.RACE2_ADMIN_PASSWORD;

if (!RACE2_ADMIN_PASSWORD) {
  console.error("RACE2_ADMIN_PASSWORD environment variable must be set before use!");
  process.exit(1);
}

var twilioClient = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

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
app.get('/.well-known/acme-challenge/GTj1Lm1K6kyCkXTs_tWVlb5VRyPQG1cgCRPSQ3uSljM', (req, res) => {
  res.send('GTj1Lm1K6kyCkXTs_tWVlb5VRyPQG1cgCRPSQ3uSljM.LBhOg_sQGhX4qrc11aSUEZWBaIcBTAt6Gqqy-BGmsFA');
});

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

let dataIntermediary;

import * as nodemailer from "nodemailer";
let xoauth2 = require("xoauth2");

const GMAIL_USER: string = process.env.GMAIL_USER;
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN

export class Emailer {
  private smtpTransport;

  constructor(xoauth2Settings) {
    let generator = xoauth2.createXOAuth2Generator(xoauth2Settings);

    generator.on('token', (token) => {
      console.log(`New token for ${token.user}: ${token.accessToken}`)
    })

    this.smtpTransport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        xoauth2: generator
      }
    });

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
      from: GMAIL_USER,
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
    return this.sendEmail(
      user.email,
      `Welcome to ${APP_NAME}, ${user.name}`,
      `
      <h1>Hello, ${user.name}</h1>
      <p>An account has been created for you on <a href='${APP_URL}'>${APP_NAME}</a></p>
      <p>Your temporary password is <b>${password}</b></p>
      `
    )
  }

  sendPasswordResetEmail(to: string, password: string) {
    return this.sendEmail(
      to,
      `${APP_NAME} Password Reset`,
      `
      <h1>${APP_NAME} Password Reset</h1>
      <p>Password reset to <b>${password}</b></p>
      `
    )
  }

  sendUnhandledRejectionEmail(reason, promise) {
    let stacktrace = newlineReplace(String(reason.stack));
    let promiseString = newlineReplace(String(promise));
    return this.sendEmail(
      ERROR_EMAIL_RECIPIENTS,
      `${APP_NAME} - Unhandled rejection!`,
      `
      <h1>${APP_NAME}- Unhandled rejection</h1>
      <p>At ${new Date()}</p>
      <h2>Promise</h2>
      <p>${promiseString}</p>
      <h2>Stacktrace</h2>
      <p>${stacktrace}</p>
      `
    )
  }

  sendUncaughtExceptionEmail(exception) {
    let stacktrace = newlineReplace(exception.stack);
    return this.sendEmail(
      ERROR_EMAIL_RECIPIENTS,
      `${APP_NAME} - Uncaught Exception!`,
      `
      <h1>${APP_NAME}- Uncaught Exception</h1>
      <p>At ${new Date()}</p>
      <h2>Stacktrace</h2>
      <p>${stacktrace}</p>
      `
    )
  }

  sendTextSentEmail(text: TwilioOutboundText) {
    return this.sendEmail(
      DATA_EMAIL_RECIPIENTS,
      `${APP_NAME} - Text sent to ${text.to}`,
      `
      <h1>${APP_NAME} - Text Sent!</h1>
      <p>To: ${text.to}</p>
      <p>Body: ${text.body}</p>
      `
    )
  }

  sendTextReceivedEmail(text: TwilioInboundText) {
    return this.sendEmail(
      DATA_EMAIL_RECIPIENTS,
      `${APP_NAME} - Text Received from ${text.From}`,
      `
      <h1>${APP_NAME} - Text Received!</h1>
      <p>From: ${text.From}</p>
      <p>Body: ${text.Body}</p>
      `
    )
  }
}
const ERROR_EMAIL_RECIPIENTS = [GMAIL_USER] + process.env.ERROR_EMAIL_RECIPIENTS.split(",");
const STATUS_EMAIL_RECIPIENTS = [GMAIL_USER] + process.env.STATUS_EMAIL_RECIPIENTS.split(",");
const DATA_EMAIL_RECIPIENTS = [GMAIL_USER] + process.env.DATA_EMAIL_RECIPIENTS.split(",");
console.log(`Will send error emails to ${ERROR_EMAIL_RECIPIENTS}`);
console.log(`Will send status emails to ${STATUS_EMAIL_RECIPIENTS}`);
console.log(`Will send data emails to ${DATA_EMAIL_RECIPIENTS}`);
const XOAUTH2_SETTINGS = {
  user: GMAIL_USER,
  clientId: GMAIL_CLIENT_ID,
  clientSecret: GMAIL_CLIENT_SECRET,
  refreshToken: GMAIL_REFRESH_TOKEN,
}
let emailer = new Emailer(XOAUTH2_SETTINGS);

let newlineReplace = (str) => str.replace(/(?:\r\n|\r|\n)/g, '<br />');
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection!', reason, promise);
  try {
    emailer.sendUnhandledRejectionEmail(reason, promise);
  } catch (err) {
    console.error('Oh noes! An error occured while trying to handle an error! This is absolutely awful!')
    console.error('New error', err);
  }
});

process.on('uncaughtException', (exception) => {
  console.error('Uncaught exception!', exception);
  try {
    emailer.sendUncaughtExceptionEmail(exception);
  } catch (err) {
    console.error('Oh noes! An error occured while trying to handle an error! This is absolutely awful!')
    console.error('New error', err);
  }
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

    dataIntermediary = GetDataIntermediary(db_facade, messageSender, emailer);


    // Check to see if the admin user has been created yet. If not, create it.
    dataIntermediary.canAddUser('admin')
    .then(can => {
      if (!can) return;
      winston.info(`Creating admin user with password: ${RACE2_ADMIN_PASSWORD}`);
      dataIntermediary.addUser('admin', RACE2_ADMIN_PASSWORD, {
        email: "N/A",
        phone: "N/A",
        name: "Administrator",
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

    let authRouter = AuthWithDataIntermediary(dataIntermediary);
    apiRouter.use('/auth', authRouter);

    let teamsRouter = teamsRouterWithDb(dataIntermediary);
    apiRouter.use('/teams', teamsRouter);

    let racersRouter = racersRouterWithDb(dataIntermediary);
    apiRouter.use("/racers", racersRouter);

    let twilioObj = {
      client: twilioClient,
      fromNumber: TWILIO_SENDING_NO
    }
    let textsRouter = textsRouterWithDb(dataIntermediary, twilioObj);
    apiRouter.use("/texts", textsRouter);

    let updatesRouter = updatesRouterWithDb(dataIntermediary);
    apiRouter.use("/updates", updatesRouter);

    let eventsRouter = eventsRouterWithDb(db_facade);
    apiRouter.use('/events', eventsRouter);

    let usersRouter = usersRouterWithDb(dataIntermediary);
    apiRouter.use('/users', usersRouter);

    let publicRouter = publicRouterWithDb(dataIntermediary);
    apiRouter.use('/public', publicRouter);

    http.listen(PORT, function() {
      winston.info(`App now listening on port: ${PORT}`);
    });

    app.post('/twiml', function(req, res) {
      if (twilio.validateExpressRequest(req, TWILIO_AUTH_TOKEN, {url: TWILIO_SMS_WEBHOOK})) {
        let text = req.body;
        winston.log('verbose', `Received text from Twilio`, {text});
        handleTextMessage(text);
        res.send();
      } else {
        winston.warn('Invalid Twilio request received!');
        res.status(403).send("Error, you're not twilio!");
      }
    });

    app.use('/r2bcknd', apiRouter);

    /*
     * Set up nodemailer for sending emails
     * Use the access token saved in the DB
     */
    dataIntermediary.getSavedConfig()
    .then(retrieved => {
      if (!retrieved) {
        return dataIntermediary.createSavedConfig()
      } else {
        return retrieved;
      }
    })
    .then(savedConfig => {

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

      emailer.sendEmail(
        STATUS_EMAIL_RECIPIENTS,
        "Server started!",
        `
        <h1>Server started!</h1>
        <p>Server started at ${new Date()}</p>
        `
      )
      .then((messageInfo) => {
        console.log(messageInfo);
      })
      .catch(err => {
        console.error(err);
      })
    })
    

}).catch(err => {
  console.error('error setting up server', err);
});


function handleTextMessage(twilioText: TwilioInboundText) {
  dataIntermediary.addTextFromTwilio(twilioText)
    .catch(err => {
      winston.error('Could not add inbound Twilio text to database!', {text: twilioText, err: err});
    });
}

