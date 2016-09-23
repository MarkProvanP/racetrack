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

import * as racer from '../common/racer';

var path = require('path');

app.use(bodyParser.urlencoded({extended: true}));

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

http.listen(PORT, function() {
  console.log('app listening on port:', PORT);
});

console.log('dirname', __dirname);

app.all('*', (req: any, res: any) => {
  console.log('req', req);
  res.status(200).sendFile(path.join(__dirname, '/../../www/index.html'));
})

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
