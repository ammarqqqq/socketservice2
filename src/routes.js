const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const config = require('./config');
const logger = require('./logger.js')

/**
 * @api {get} /info Greeting from server
 * @apiVersion 1.0.0
 * @apiName GetInfo
 * @apiGroup Socketservice
 *
 * @apiSuccess {String} Greeting from server.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "Welcome to the user service"
 *     }
 */
router.get('/info', function (req, res) {
  res.send("Welcome to the socket service");
});

router.get('/socket', function (req, res) {
  res.send("Welcome to the socket service");
});

module.exports = router;
