/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
var bodyParser = require('body-parser');
var xhub = require('express-x-hub');
var express = require('express');
var app = express();
app.use('/', express.static(__dirname + '/'));
var port =  (process.env.PORT || 5000);
app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());
// websocket setup
var WebSocketServer = require("ws").Server;
var http = require("http");
var server = http.createServer(app);
server.listen(port);
var wss = new WebSocketServer({server: server});

wss.on("connection", function(application, ws) {
  console.log("Web Socket Connected");
application.post('/facebook', function(websocket, req, res) {
  console.log('Facebook request body:');
  console.log(req.body);
  var entry = req.body.entry;
  for (i = 0 ; i < entry.length; i++) {
    var changes = entry[i].changes;
    for (j = 0; j < changes.length; j++) {
      console.log(changes[j]);
      websocket.send(JSON.stringify(changes[j]));
    }
  }
  // Process the Facebook updates here
  res.sendStatus(200);
}.bind(this, ws));  
  ws.on("close", function() {
    console.log("Web Socket Closed");
  });
}.bind(this, app));

app.get(['/facebook', '/instagram'], function(req, res) {
    if (
      req.param('hub.mode') == 'subscribe' &&
      req.param('hub.verify_token') == 'token'
    ) {
      res.send(req.param('hub.challenge'));
    } else {
      res.sendStatus(400);
    }
  });  

app.get('/', function(req, res) { res.sendFile('index.html', { root: __dirname} ); });

app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  res.sendStatus(200);
});

app.listen();
