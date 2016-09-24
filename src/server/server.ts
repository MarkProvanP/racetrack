"use strict";
import * as express from "express";
var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);
var bodyParser = require('body-parser');

import * as config from './server-config';

var twilio = require('twilio');
var twilioClient = twilio(config.accountSid, config.authToken);

var PORT = config.SERVER_PORT;

import { Racer } from '../common/racer';
import { Team } from '../common/team';

var path = require('path');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST");
  next();
});

import { DbFacadeInterface } from './db/db-facade';
import { InMemoryDbFacade } from './db/in-memory-db-facade';
let db_facade : DbFacadeInterface = new InMemoryDbFacade();

app.post('/twiml', function(req, res) {
  if (twilio.validateExpressRequest(req, config.authToken, {url: config.twilioSMSWebHook})) {
    let text = req.body;
    handleTextMessage(text);
    res.send("ok");
  } else {
    res.status(403).send("Error, you're not twilio!");
  }
});

import teamsRouterWithDb from "./routes/teams.routes";
let teamsRouter = teamsRouterWithDb(db_facade);
app.use('/teams', teamsRouter);

import racersRouterWithDb from "./routes/racers.routes";
let racersRouter = racersRouterWithDb(db_facade);
app.use("/racers", racersRouter);

import textsRouterWithDb from "./routes/texts.routes";
let textsRouter = textsRouterWithDb(db_facade);
app.use("/texts", textsRouter);

import updatesRouterWithDb from "./routes/updates.routes";
let updatesRouter = updatesRouterWithDb(db_facade);
app.use("/updates", updatesRouter);

http.listen(PORT, function() {
  console.log('app listening on port:', PORT);
});

function handleTextMessage(text: any) {
  // Find which user, if any, the text came from
  db_facade.addText(text);
  let fromNumber = text.From;
  db_facade.getRacers()
    .then(racers => {
      let filtered = racers.filter(racer => racer.phone === fromNumber)
      if (filtered.length == 1) {
        let foundRacer = filtered[0];
        let msgObj = {
          fromRacer: foundRacer,
          text: text
        }
        sendToWebClients('receivedText', JSON.stringify(msgObj));
      } else {
        // Otherwise, send the message on anyway.
        sendToWebClients('receivedUnknownText', JSON.stringify(text));
      }
    });
}

function sendToWebClients(event, message) {
  webClients.forEach(socket => socket.emit(event, message));
}

let webClients = [];

io.on('connection', function(socket) {
  console.log('Web client connected');
  webClients.push(socket);

  socket.on('disconnect', function() {
    console.log('Web client disconnecting');
    let index = webClients.indexOf(socket);
    if (index > -1) {
      webClients.splice(index, 1);
    }
  });

  socket.on('sendMessage', function(msg) {
    console.log('sendMessage');
    var msgObj = JSON.parse(msg);
    console.log(msgObj);
    twilioClient.messages.create({
      body: msgObj.message,
      to: msgObj.to,
      from: config.sendingNo
    }, function(err, data) {
      if (err) {
        console.log('error!');
        console.log(err);
      } else {
        console.log('success');
      }
    })
  });
});
