"use strict";
import * as express from "express";
var app = express();

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
var twilioClient = twilio(config.accountSid, config.authToken);

const PORT = process.env.PORT || config.SERVER_PORT;

const MONGODB_URI = process.env.MONGODB_URI || config.db_url;

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

const SESSION_SECRET = 'kewbfklebhfrhaewbfabfjbhzsfkjbkasjbvhkjaswbhdrvfkashbfvhavfha';
const SESSION_KEY = "express.sid";

import { AuthWithDbFacade } from "./auth";

import teamsRouterWithDb from "./routes/teams.routes";
import publicRouterWithDb from "./routes/public.routes";
import racersRouterWithDb from "./routes/racers.routes";
import textsRouterWithDb from "./routes/texts.routes";
import updatesRouterWithDb from "./routes/updates.routes";
import eventsRouterWithDb from "./routes/events.routes";

import { GetDataIntermediary } from "./data-intermediate";
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

    let authRouter = AuthWithDbFacade(db_facade);
    app.use('/auth', authRouter);

    let teamsRouter = teamsRouterWithDb(dataIntermediary);
    app.use('/teams', teamsRouter);

    let racersRouter = racersRouterWithDb(dataIntermediary);
    app.use("/racers", racersRouter);

    let twilioObj = {
      client: twilioClient,
      fromNumber: config.sendingNo
    }
    let textsRouter = textsRouterWithDb(dataIntermediary, twilioObj);
    app.use("/texts", textsRouter);

    let updatesRouter = updatesRouterWithDb(dataIntermediary);
    app.use("/updates", updatesRouter);

    let eventsRouter = eventsRouterWithDb(db_facade);
    app.use('/events', eventsRouter);

    let publicRouter = publicRouterWithDb(dataIntermediary);
    app.use('/public', publicRouter);

    http.listen(PORT, function() {
      winston.info(`App now listening on port: ${PORT}`);
    });

    app.post('/twiml', function(req, res) {
      if (twilio.validateExpressRequest(req, config.authToken, {url: config.twilioSMSWebHook})) {
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
}).catch(err => {
  console.error('error setting up server', err);
});


function handleTextMessage(db_facade, twilioText: TwilioInboundText) {
  dataIntermediary.addTextFromTwilio(twilioText)
    .catch(err => {
      winston.error('Could not add inbound Twilio text to database!', {text: twilioText, err: err});
    });
}

