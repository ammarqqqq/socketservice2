require('@risingstack/trace');
const express = require('express');
const https = require('https');
const http = require("http");
const request = require("request");
const bodyParser = require('body-parser');
const fs = require('fs');
const config = require('./config');
const logger = require('./logger.js')
const morgan = require('morgan');
var constants = require('constants')


const app = express();
const portnr = process.env.NODE_PORT || 8038;

app.set('superSecret', config.secret); // secret variable

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("ServiceName", config.serviceName);
  next();
});


var routes = require('./routes');
//var backEndRoutes = require('./backofficeroutes');
app.use('/', routes);
//app.use('/backoffice', backEndRoutes)
logger.stream = {
  write: function(message, encoding){
    logger.info(message);
  }
};

app.use(morgan("combined", { "stream": logger.stream }));

module.exports = app;
module.exports.start = function(){


    var credentials = {
        key: fs.readFileSync('/certs/chain.key'),
        cert: fs.readFileSync('/certs/chain.crt'),
        requestCert: true,
        rejectUnauthorized: true
    };


var httpsServer = https.createServer(credentials, app); // change to https when we get certificates
httpsServer.listen(portnr);
const socketio = require('./sockets').listen(httpsServer);
logger.info(config.serviceName + " server started. -- " + process.env.NODE_ENV);

}
