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
    console.log('db_facade available');

    let teamsRouter = teamsRouterWithDb(db_facade);
    app.use('/teams', teamsRouter);

    let racersRouter = racersRouterWithDb(db_facade);
    app.use("/racers", racersRouter);

    let textsRouter = textsRouterWithDb(db_facade);
    app.use("/texts", textsRouter);

    let updatesRouter = updatesRouterWithDb(db_facade);
    app.use("/updates", updatesRouter);

    http.listen(PORT, function() {
      console.log('app listening on port:', PORT);
    });

    app.post('/twiml', function(req, res) {
      if (twilio.validateExpressRequest(req, config.authToken, {url: config.twilioSMSWebHook})) {
        let text = req.body;
        handleTextMessage(db_facade, text);
        res.send("ok");
      } else {
        res.status(403).send("Error, you're not twilio!");
      }
    });

  });


function handleTextMessage(db_facade, text: any) {
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
