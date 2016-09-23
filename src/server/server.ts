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

var path = require('path');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST");
  next();
});


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

let racers = [
  {id: 200, name: 'Tom Smith', nationality: 'GB', phone: '+12134732'},
  {id: 201, name: 'Dick Stanley', nationality: 'GB', phone: '+1912912'},
  {id: 202, name: 'Harry Monaghan', nationality: 'US', phone: '+121240342'},
  {id: 203, name: 'Sally Garrard', nationality: 'CA', phone: '+12554654'},
  {id: 204, name: 'Jess Swanwick', nationality: 'FR', phone: '+121239123'},
  {id: 205, name: 'Veronica Thomson', nationality: 'DE', phone: '+1289238942'}
];
let nextRacerId = 206;
let teams = [
  {id: 21, name: 'H2G2', racers: [
    racers[0], racers[2], racers[4] 
  ]},
  {id: 22, name: 'Prague or Bust', racers: [
    racers[1], racers[3], racers[5]
  ]}
];
let nextTeamId = 23;

app.get('/teams', function(req, res) {
  res.type('text/json');
  res.send(JSON.stringify(teams));
})

app.get('/racers', function(req, res) {
  console.log('GET /racers'); 
  res.type('text/json');
  res.send(JSON.stringify(racers));
})

app.post('/racers', function(req, res) {
  console.log('POST /racers')
  let body = req.body;
  console.log(req);
  console.log(body);
  let newRacerName = body.name;
  let newRacer = new Racer(nextRacerId, newRacerName);
  racers.push(newRacer);
  nextRacerId++;
  res.type('application/json');
  res.send(JSON.stringify(newRacer));
})

app.put('/racers/:id', function(req, res) {
  console.log('PUT /racers')
  let body = req.body;
  console.log(body);
  let changedRacer = body as Racer;
  console.log(changedRacer);

  for (let i = 0; i < racers.length; i++) {
    if (racers[i].id === changedRacer.id) {
      racers[i] = changedRacer;
    }
  }
  res.end('successfully updated racer');
})

app.delete('/racers/:id', function(req, res) {
  console.log('DELETE /racers');
  let body = req.body;
  console.log(body);
  let deletedRacer = body as Racer;
  console.log(deletedRacer);

  for (let i = 0; i < racers.length; i++) {
    if (racers[i].id === deletedRacer.id) {
      racers.splice(i, 1);
    }
  }
  res.end('successfully deleted racer');
})

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
