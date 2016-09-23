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

import * as db_facade from './db-facade';

app.post('/twiml', function(req, res) {
  if (twilio.validateExpressRequest(req, config.authToken, {url: config.twilioSMSWebHook})) {
    var body = req.body;
    console.log(body);
    var resp = new twilio.TwimlResponse();
    resp.say('express says hello');
    res.type('text/xml');
    res.send(resp.toString());
  } else {
    console.log('validation failure');
    console.log(req);
    res.status(403).send("Error, you're not twilio!");
  }
});

import teamsRouter from "./routes/teams.routes";

app.use('/teams', teamsRouter);

import racersRouter from "./routes/racers.routes";

app.use("/racers", racersRouter);

http.listen(PORT, function() {
  console.log('app listening on port:', PORT);
});

io.on('connection', function(socket) {
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
  console.log('user connected');
});
