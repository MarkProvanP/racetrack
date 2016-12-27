"use strict";
import * as express from "express";
var app = express();

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
import { Text, TwilioInboundText } from "../common/text";
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

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN

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

    dataIntermediary = GetDataIntermediary(db_facade, messageSender);


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
        handleTextMessage(db_facade, text);
        let response = new twilio.TwimlResponse();
        response.message("Working");
        res.send(response.toString());
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
      const XOAUTH2_SETTINGS = {
        user: GMAIL_USER,
        clientId: GMAIL_CLIENT_ID,
        clientSecret: GMAIL_CLIENT_SECRET,
        refreshToken: GMAIL_REFRESH_TOKEN,
        accessToken: savedConfig.nodemailer.accessToken
      }

      let generator = xoauth2.createXOAuth2Generator(XOAUTH2_SETTINGS);

      generator.on('token', (token) => {
        console.log(`New token for ${token.user}: ${token.accessToken}`)
        let newConfig = JSON.parse(JSON.stringify(savedConfig));
        newConfig.nodemailer.accessToken = token.accessToken;
        dataIntermediary.updateSavedConfig(newConfig);
      })

      let smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          xoauth2: generator
        }
      });

      process.on('uncaughtException', (exception) => {
        console.error('Uncaught exception!', exception);
        let stacktrace = String(exception.stack).replace(/(?:\r\n|\r|\n)/g, '<br />');
        let mailOptions = {
          from: GMAIL_USER,
          to: [GMAIL_USER, "markprovanp@gmail.com"],
          subject: "Race2App - Uncaught Exception!",
          generateTextFromHTML: true,
          html: `
          <h1>Race2App - Uncaught Exception</h1>
          <p>At ${new Date()}</p>
          <h2>Stacktrace</h2>
          <p>${stacktrace}</p>
          `
        };

        smtpTransport.sendMail(mailOptions, (err, res) => {
          if (err) {
            console.error(err);
          } else {
            console.log(res);
          }
        })
      })

      apiRouter.post("/email", (req, res) => {
        let mailOptions = req.body;
        mailOptions.from = GMAIL_USER;
        smtpTransport.sendMail(mailOptions, (err, messageInfo) => {
          if (err) {
            console.error(err);
            res.status(500).send(err);
          } else {
            console.log(res);
            res.send(messageInfo);
          }
        })
      })

      apiRouter.get("/exception", (req, res) => {
        throw new Error('Oh dear!')
      })

      let mailOptions = {
        from: GMAIL_USER,
        to: [GMAIL_USER, "markprovanp@gmail.com"],
        subject: "Server Started!",
        generateTextFromHTML: true,
        html: `
        <h1>Server started!</h1>
        <p>Server started at ${new Date()}</p>
        `
      };

      smtpTransport.sendMail(mailOptions, (err, res) => {
        if (err) {
          console.error(err);
        } else {
          console.log(res);
        }
      })
    })
    

}).catch(err => {
  console.error('error setting up server', err);
});


function handleTextMessage(db_facade, twilioText: TwilioInboundText) {
  dataIntermediary.addTextFromTwilio(twilioText)
    .catch(err => {
      winston.error('Could not add inbound Twilio text to database!', {text: twilioText, err: err});
    });
}

