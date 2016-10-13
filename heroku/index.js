/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var xhub = require('express-x-hub');
var socketIO = require('socket.io');

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));

// setup socket io for communication
const io = socketIO(app.createServer());
io.on('connection', function (socket) {
  console.log('Client connected');
  socket.on('disconnect', function() { console.log('Client disconnected'); });
}); 

app.use(xhub({ algorithm: 'sha1', secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendfile('index.html', {root: __dirname});
});

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

app.post('/facebook', function(io, req, res) {
  console.log('Facebook request body:');

  /*
  if (req.isXHub) {
    console.log('request header X-Hub-Signature found, validating');
    if (req.isXHubValid()) {
      console.log('request header X-Hub-Signature validated');
      res.send('Verified!\n');
    }
  }
  else {
    console.log('Warning - request header X-Hub-Signature not present or invalid');
    res.send('Failed to verify!\n');
    // recommend sending 401 status in production for non-validated signatures
    // res.sendStatus(401);
  } */
  
  var entry = req.body.entry;
  for (i = 0 ; i < entry.length; i++) {
    var changes = entry[i].changes;
    for (j = 0; j < changes.length; j++) {
      console.log(changes[j]);
      io.emit('update_feed', {message: 'Received Message'} );
    }
  }
  

  // Process the Facebook updates here
  res.sendStatus(200);
}.bind(io));

app.post('/instagram', function(req, res) {
  console.log('Instagram request body:');
  console.log(req.body);
  // Process the Instagram updates here
  res.sendStatus(200);
});

app.listen();
