"use strict";
import * as express from "express";
var app = express();

import * as winston from "winston";
winston.add(winston.transports.File, { filename: 'logfile.log' })

var http = require('http').Server(app);

var io = require('socket.io')(http);
var bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let expressSession = require('express-session')
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

import * as config from '../../app-config';

var twilio = require('twilio');
var twilioClient = twilio(config.accountSid, config.authToken);

var PORT = config.SERVER_PORT;

import { Racer } from '../common/racer';
import { Team } from '../common/team';
import { Text, TwilioInboundText } from "../common/text";
import { TextReceivedMessage } from "../common/message";

var path = require('path');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(expressSession({
  secret: 'kewbfklebhfrhaewbfabfjbhzsfkjbkasjbvhkjaswbhdrvfkashbfvhavfha',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

import { AuthWithDbFacade } from "./auth";

import teamsRouterWithDb from "./routes/teams.routes";
import racersRouterWithDb from "./routes/racers.routes";
import textsRouterWithDb from "./routes/texts.routes";
import updatesRouterWithDb from "./routes/updates.routes";

import { DbFacadeInterface } from './db/db-facade';
import { InMemoryDbFacade } from './db/in-memory-db-facade';
import { setup } from './db/mongo-db-facade';
//let db_facade : DbFacadeInterface = new InMemoryDbFacade();
setup(config.db_url)
  .then(db_facade => {
    winston.info('MongoDB now ready for use');

    let authRouter = AuthWithDbFacade(db_facade);
    app.use('/auth', authRouter);

    let teamsRouter = teamsRouterWithDb(db_facade);
    app.use('/teams', teamsRouter);

    let racersRouter = racersRouterWithDb(db_facade);
    app.use("/racers", racersRouter);

    let twilioObj = {
      client: twilioClient,
      fromNumber: config.sendingNo
    }
    let textsRouter = textsRouterWithDb(db_facade, twilioObj);
    app.use("/texts", textsRouter);

    let updatesRouter = updatesRouterWithDb(db_facade);
    app.use("/updates", updatesRouter);

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

  });


function handleTextMessage(db_facade, twilioText: TwilioInboundText) {
  db_facade.createFromInboundText(twilioText)
    .then(text => {
      let newMessage = new TextReceivedMessage(text)
      sendMessageToWebClients(newMessage);
    })
    .catch(err => {
      winston.error('Could not add inbound Twilio text to database!', {text: twilioText, err: err});
    });
}

function sendMessageToWebClients(message: TextReceivedMessage) {
  let event = message.getEvent();
  let body = JSON.stringify(message);
  webClients.forEach(socket => socket.emit(event, body));
}

let webClients = [];

io.on('connection', function(socket) {
  winston.log('verbose', 'Socket.io connection from web client started');
  webClients.push(socket);

  socket.on('disconnect', function() {
    winston.log('verbose', 'Socket.io connection from web client ended');
    let index = webClients.indexOf(socket);
    if (index > -1) {
      webClients.splice(index, 1);
    }
  });
});
