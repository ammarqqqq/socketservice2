const socketio = require('socket.io')
const jwt = require('jwt-simple');
const config = require('./config');
const async = require('async');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const logger = require('./logger.js')
const request = require('request');
const fs = require('fs');

const serviceLookupHandler = require("./consulLookup.js");

// TODO, this is unsafe, however its only used on delete which should be removed anyway


module.exports.listen = function(app){

    var users = []; // need a map here token -> user --> accounts

    var io = socketio.listen(app, {secure: true, rejectUnauthorized: true});

     checkauthentication = function(token) {

      return new Promise(
        function(resolve , reject) {
          serviceLookupHandler.serviceLookup("authenticationservice-8080", 'authenticated').then(serverAddress => {
            request({
                url: "https://"+ serverAddress.address + ":" + serverAddress.port + "/" + serverAddress.routePath , //URL to hit
                qs: {time: +new Date()}, //Query string data
                method: 'GET',
                headers: {
                  // 'host': req.headers.host,
                  'host': 'local.monifair.com',
                  'servicename': config.serviceName,
                  'authorization': token
                },
                key: fs.readFileSync('/certs/chain.key'),
                cert: fs.readFileSync('/certs/chain.crt')
            }, function(error, response, body){
                if(error) {
                  logger.error(error);
                  reject(error);
                } else {
                  logger.info(body);
                  // this fails on the 502 error and any other errors in the socket service, lucky catch
                  var jsonObject = JSON.parse(body);
                  console.log(jsonObject);
                  if (jsonObject.success) {
                    resolve(jsonObject.msg);
                  } else {

                    // TODO: this implies always a  json object of this kind, this might throw exception on msg.
                    reject(jsonObject.msg);
                  }
                }
            });
          });
        }
      );
    };

     doTransfer = function(data, token) {

       return new Promise(
         function(resolve , reject) {

           serviceLookupHandler.serviceLookup("transactionservice-8080", 'savetransactionalaccountinfo').then(serverAddress => {
             console.log("server logs : " ,serverAddress.address,' ' ,  serverAddress.port,' ' ,serverAddress.routePath  )
             console.log('DATA(BODY): ', data)
             request({
                 url: "https://"+ serverAddress.address + ":" + serverAddress.port + "/" + serverAddress.routePath , //URL to hit
                 port: 443,
                 qs: {time: + new Date()}, //Query string data
                 method: 'POST',
                 json: data,
                 headers: {
                  //  'host': req.headers.host,
                  'host': 'local.monifair.com',
                   'servicename': config.serviceName,
                   'authorization': token
                 },
                 key: fs.readFileSync('/certs/chain.key'),
                 cert: fs.readFileSync('/certs/chain.crt')
           }, function(error, response){
           if(error) {
             logger.error(error);
             reject(error);
           } else {
             console.log("Response from transaction: ",response.body)
             resolve(response.body);
           }
       });
         }).catch(err => {
           console.log(err)
           reject(err);
         })
       });
    };

     linkEthereumToUser = function(data,token) {

       console.log("data passed to createaccount in userandaccountservice: ",data);

       return new Promise(
         function(resolve , reject) {
           serviceLookupHandler.serviceLookup("userandaccountservice-8080", 'createaccount').then(serverAddress => {
             console.log("server logs : " ,serverAddress.address,' ' ,  serverAddress.port,' ' ,serverAddress.routePath)
             request({
                 url: "https://"+ serverAddress.address + ":" + serverAddress.port + "/" + serverAddress.routePath , //URL to hit
                 port: 443,
                 qs: {time: + new Date()}, //Query string data
                 method: 'POST',
                 json: data,
                 headers: {
                  //  'host': req.headers.host,
                  'host': 'local.monifair.com',
                  'servicename': config.serviceName,
                  'authorization':token
                 },
                 key: fs.readFileSync('/certs/chain.key'),
                 cert: fs.readFileSync('/certs/chain.crt')
           }, function(error, response){
           if(error) {
             logger.error(error);
             reject(error);
           } else {
             console.log("Response from userandaccountservice: ",response.body)
             resolve(response.body);
           }
       });
         }).catch(err => {
           console.log(err)
           reject(err);
         })
       });
    };

    getUserByMobile = function(mobileNumber, token) {

      return new Promise(
        function(resolve , reject) {
          serviceLookupHandler.serviceLookup("userandaccountservice-8080", 'getuserbymobile').then(serverAddress => {
            console.log("server logs : " ,serverAddress.address,' ' ,  serverAddress.port,' ' ,serverAddress.routePath  )
            request({
                url: "https://"+ serverAddress.address + ":" + serverAddress.port + "/" + serverAddress.routePath , //URL to hit
                port: 443,
                qs: {time: + new Date()}, //Query string data
                method: 'GET',
                json: {mobileNumber:mobileNumber},
                headers: {
                 //  'host': req.headers.host,
                 'host': 'local.monifair.com',
                  'servicename': config.serviceName,
                  'authorization': token
                },
                key: fs.readFileSync('/certs/chain.key'),
                cert: fs.readFileSync('/certs/chain.crt')
          }, function(error, response){
          if(error) {
            logger.error(error);
            reject(error);
          } else {
            console.log("Response from userandaccountservice: ",response.body)
            resolve(response.body);
          }
      });
        }).catch(err => {
          console.log(err)
          reject(err);
        })
      });
    }

    getAccountsForUserByToken = function(token) {

      console.log("Token to be sent to user and account service: ", token)


      return new Promise(
        function(resolve , reject) {
          serviceLookupHandler.serviceLookup("userandaccountservice-8080", 'getallaccountsforuserbytoken').then(serverAddress => {
            console.log("server logs : " ,serverAddress.address,' ' ,  serverAddress.port,' ' ,serverAddress.routePath  )
            request({
                url: "https://"+ serverAddress.address + ":" + serverAddress.port + "/" + serverAddress.routePath , //URL to hit
                port: 443,
                qs: {time: + new Date()}, //Query string data
                method: 'GET',
                headers: {
                 //  'host': req.headers.host,
                 'host': 'local.monifair.com',
                  'servicename': config.serviceName,
                  'authorization': token
                },
                key: fs.readFileSync('/certs/chain.key'),
                cert: fs.readFileSync('/certs/chain.crt')
          }, function(error, response){
          if(error) {
            logger.error(error);
            reject(error);
          } else {
            console.log("Response from userandaccountservice: ",response.body)
            resolve(JSON.parse(response.body));
          }
      });
        }).catch(err => {
          console.log(err)
          reject(err);
        })
      });
   };

    getAccountsForUserById = function(id) {

      console.log("ID to be sent to user and account service: ", id)


      return new Promise(
        function(resolve , reject) {
          serviceLookupHandler.serviceLookup("userandaccountservice-8080", 'getallaccountsforuserbyid/'+id).then(serverAddress => {
            console.log("server logs : " ,serverAddress.address,' ' ,  serverAddress.port,' ' ,serverAddress.routePath  )
            request({
                url: "https://"+ serverAddress.address + ":" + serverAddress.port + "/" + serverAddress.routePath , //URL to hit
                port: 443,
                qs: {time: + new Date()}, //Query string data
                method: 'GET',
                headers: {
                 //  'host': req.headers.host,
                 'host': 'local.monifair.com',
                  'servicename': config.serviceName
                },
                key: fs.readFileSync('/certs/chain.key'),
                cert: fs.readFileSync('/certs/chain.crt')
          }, function(error, response){
          if(error) {
            logger.error(error);
            reject(error);
          } else {
            console.log("Response from - getaccountforuserbyid - userandaccountservice: ",response.body)
            resolve(JSON.parse(response.body));
          }
      });
        }).catch(err => {
          console.log(err)
          reject(err);
        })
      });
   };

    createEthereumAccountAddress = function() {

      return new Promise(
        function(resolve , reject) {
          serviceLookupHandler.serviceLookup("transactionservice-8080", 'createethereumaccount').then(serverAddress => {
            console.log("server logs : " ,serverAddress.address,' ' ,  serverAddress.port,' ' ,serverAddress.routePath  )
            request({
                url: "https://"+ serverAddress.address + ":" + serverAddress.port + "/" + serverAddress.routePath , //URL to hit
                port: 443,
                qs: {time: + new Date()}, //Query string data
                method: 'GET',
                headers: {
                 //  'host': req.headers.host,
                 'host': 'local.monifair.com',
                  'servicename': config.serviceName
                },
                key: fs.readFileSync('/certs/chain.key'),
                cert: fs.readFileSync('/certs/chain.crt')
          }, function(error, response){
          if(error) {
            logger.error(error);
            reject(error);
          } else {
            console.log("Response from transaction: ",response.body)
            resolve(JSON.parse(response.body));
          }
      });
        }).catch(err => {
          console.log(err)
          reject(err);
        })
      });
   };

   /*NOTE necessary to mine before deploying contract.
   1. exec into ethereum container
   2. run command: ./geth attach  ipc://root/.ethereum/devchain/geth.ipc
   3. run command: miner.start()
   4. docker logs the ethereum container and wait for mining to finish = dag at 100%
   */

   //TODO will change from get to post. pass user`s accountaddress in body for post.
   createContractAddress = function(data) {
     return new Promise(
       function(resolve , reject) {
         serviceLookupHandler.serviceLookup("transactionservice-8080", 'getaccountcontract').then(serverAddress => {
           console.log("server logs : " ,serverAddress.address,' ' ,  serverAddress.port,' ' ,serverAddress.routePath  )
           request({
               url: "https://"+ serverAddress.address + ":" + serverAddress.port + "/" + serverAddress.routePath , //URL to hit
               port: 443,
               qs: {time: + new Date()}, //Query string data
               method: 'POST',
               json: data,
               headers: {
                //  'host': req.headers.host,
                'host': 'local.monifair.com',
                 'servicename': config.serviceName
               },
               key: fs.readFileSync('/certs/chain.key'),
               cert: fs.readFileSync('/certs/chain.crt')
         }, function(error, response){
         if(error) {
           logger.error(error);
           reject(error);
         } else {
           console.log("Response from transaction: ",response.body)
           resolve(response.body);
         }
     });
       }).catch(err => {
         console.log(err)
         reject(err);
       })
     });
   }

   getBalance = function(data) {
     console.log("getbalancemethod hit")
     return new Promise(
       function(resolve , reject) {
         serviceLookupHandler.serviceLookup("transactionservice-8080", 'getuseramount').then(serverAddress => {
           console.log("server logs : " ,serverAddress.address,' ' ,  serverAddress.port,' ' ,serverAddress.routePath  )
           request({
               url: "https://"+ serverAddress.address + ":" + serverAddress.port + "/" + serverAddress.routePath , //URL to hit
               port: 443,
               qs: {time: + new Date()}, //Query string data
               method: 'POST',
               json: data,
               headers: {
                //  'host': req.headers.host,
                'host': 'local.monifair.com',
                'servicename': config.serviceName
               },
               key: fs.readFileSync('/certs/chain.key'),
               cert: fs.readFileSync('/certs/chain.crt')
         }, function(error, response){
         if(error) {
           logger.error(error);
           reject(error);
         } else {
           console.log("Response from transaction for balance: ",response.body)
           resolve(response.body);
         }
     });
       }).catch(err => {
         console.log(err)
         reject(err);
       })
     });
   }

   linkContractAddress = function(data,token) {
     console.log("data in linkcontractaddress: ", data)
     return new Promise(
       function(resolve , reject) {
         serviceLookupHandler.serviceLookup("userandaccountservice-8080", 'addcontractaddress').then(serverAddress => {
           console.log("server logs : " ,serverAddress.address,' ' ,  serverAddress.port,' ' ,serverAddress.routePath  )
           request({
               url: "https://"+ serverAddress.address + ":" + serverAddress.port + "/" + serverAddress.routePath , //URL to hit
               port: 443,
               qs: {time: + new Date()}, //Query string data
               method: 'POST',
               json: data,
               headers: {
                //  'host': req.headers.host,
                'host': 'local.monifair.com',
                'servicename': config.serviceName,
                'authorization': token
               },
               key: fs.readFileSync('/certs/chain.key'),
               cert: fs.readFileSync('/certs/chain.crt')
         }, function(error, response){
         if(error) {
           logger.error(error);
           reject(error);
         } else {
           console.log("Response from userandaccount: ",response.body)
           resolve(response.body);
         }
     });
       }).catch(err => {
         console.log(err)
         reject(err);
       })
     });
   }

    io.on('connection', function(socket){
      console.log(JSON.stringify(socket.request._query));

      var socketID = socket.id;
      console.log("SOCKET ID: ",socketID)


      socket.on('initialConnection', function(){
        console.log("Token from client to socket: ",socket.handshake.query['token'])

        if(socket.handshake.query['token'] == undefined) {
          io.to(socketID).emit('error', {errorMessage: "Token undefined."})
        } else {
          var token = socket.handshake.query['token'];
          // var token = socket.handshake.query['token'].slice(4);
        }
        if (!token) io.to(socketID).emit('error', {errorMessage: "No token is supplied."} );

        io.to(socketID).emit('message', 'You are connected from connect!');
      checkauthentication(token).then(info => {
        logger.info("checkauthentication before querying user for accounts")
        getAccountsForUserByToken(token).then(response => {
          logger.info("GetAccountForUserByToken started")
          if(!response[0]){
            console.log('User has no account. Creating account!')
            createEthereumAccountAddress().then(response => {
              logger.info("createEthereumAccountAddress started")
              linkData = {
                blockchainAccountAddress: response,
                blockchainAccountCredentials: "password" //hard coded credentials. Will change to dynamic
              }
              linkEthereumToUser(linkData, token).then(response => {
                logger.info("linkethereumtouser started")
                createContractAddress(linkData).then(response => {
                  logger.info("createcontractaddress started")
                  console.log("here is the createcontractaddress return: ",response.contractAddress)
                  contractLinkData = {
                    blockchainContractAddress: response.contractAddress
                  }
                  linkContractAddress(contractLinkData,token).then(response => {
                    logger.info("LinkContractAddress started")
                    console.log(response)
                    io.to(socketID).emit('checkAccounts', JSON.stringify({message: 'New users account created on blockchain and link created on user and account service'}))
                  }).catch(error => {
                    console.log(error)
                    io.to(socketID).emit('checkAccounts', JSON.stringify({errorMessage: error}))
                  })
                }).catch(error => {
                  console.log(error)
                  io.to(socketID).emit('checkAccounts', JSON.stringify({errorMessage: error}))
                })
              }).catch(error => {
                console.log(error)
                io.to(socketID).emit('checkAccounts', JSON.stringify({errorMessage: error}))
              })
            }).catch(error => {
              console.log(error)
              io.to(socketID).emit('checkAccounts', JSON.stringify({errorMessage: error}))
            })
          } else {
            console.log('User already has an account')
            io.to(socketID).emit('checkAccounts', JSON.stringify({message: 'user has accounts',accounts: response}))
          }
        }).catch(error => {
          console.log(error)
          io.to(socketID).emit('checkAccounts', JSON.stringify({errorMessage: error}))
        })
      }).catch(error => {
        io.to(socketID).emit("getSocketTestReply", JSON.stringify({errorMessage: error}));
      })

    })

      // if no token query on socket return error json

      // TODO:
      // we need to get the user based on the token in socket.somthing.data
      // we need to get accounts from ethereum or generate account if no account, would be a first time user perhaps, need a global error service to answer here, or infact localizied ...
        // we need the account database
          // query database user._user id ? if accounts empty, do stuff

      // NOTE. if accounts already we must test if !! temp transactions,
        // here we must present some message to user about what account options he wants,
        // does it want a soci80bank account we need to offer a contract
          // event objects here?
          // state machine?
          // some interaction !!
      // then

      // put in a map, socket.id -> user --> accounts mappings
      // should we have a slow runnig loop to evict from this map? power saving?

      logger.info('a client with id ' + socket.id + ' connected to the server');

      io.to(socketID).emit('connect', 'You are connected from connect!');

      io.to(socketID).emit('message', 'You are connected general message!');

      socket.on('getBalance', function(){
        logger.info('getBalance')
        var token = socket.handshake.query['token'];


        getAccountsForUserByToken(token).then(accounts => {
          var data = {};
          data.blockchainAccountAddress = accounts[0].blockchainAccountAddress;
          data.blockchainContractAddressFrom = accounts[0].blockchainContractAddress;
          getBalance(data).then(response => {
            console.log("response from getbalance: ",response)
            io.to(socketID).emit("getBalance", JSON.stringify({data:response}));
          }).catch(error => {
            io.to(socketID).emit("getBalance", JSON.stringify({errorMessage:error}));
          })
        }).catch(error => {
          io.to(socketID).emit("getBalance", JSON.stringify({errorMessage:error}));
        })
      })

      socket.on('message', function(token) {
        logger.info("message ", token);
        logger.info('You got a  general message!');
        io.to(socketID).emit("generalmessageevent", JSON.stringify("general received on server"));
      })

      socket.on('getTest', function(token) {
        logger.info("getTest ", token);
        io.to(socketID).emit("testReply", JSON.stringify("test"));
      })

      socket.on('getSocketTest', function(data) {
        logger.info("getSocketTest ", data);
        checkauthentication(data.token).then(info => {
          io.to(socketID).emit("getSocketTestReply", JSON.stringify({data: "test from server"}));
        }).catch(error => {
          io.to(socketID).emit("getSocketTestReply", JSON.stringify({errorMessage: error}));
        })
      });

      socket.on('error', function(data){
        logger.error("Server socket error! " + data);
      });

      socket.on('unauthorized', function(error){
        logger.error("Server socket error!" + JSON.stringify(error.statusText));
      });

      socket.on('doTransfer', function(data){
        logger.info("doTransfer ",data)


        // NOTE subject to change in future
        checkauthentication(data.token).then(info => {
          logger.info("checkauthentication before querying user for accounts")
          getAccountsForUserByToken(data.token).then(accounts => {
            data.accountAddressFrom = accounts[0].blockchainAccountAddress;
            data.blockchainContractAddressFrom = accounts[0].blockchainContractAddress;
            data.blockchainAccountCredentials = accounts[0].blockchainAccountCredentials;
            console.log("tonumber: ",data.toNumber)
            getUserByMobile(data.toNumber , socket.handshake.query['token']).then(user => {
              console.log("get mobile obj: ",user)
              console.log("user from mobile: ",user._id)
              getAccountsForUserById(user._id).then(accountsById => {
                console.log("accounts from ID: ",accountsById)
                data.accountAddressTo = accountsById[0].blockchainAccountAddress
                data.blockchainContractAddressTo = accountsById[0].blockchainContractAddress;
                data.blockchainAccountCredentials = accountsById[0].blockchainAccountCredentials;
                console.log("data to send to transactionservice: ",data)
                doTransfer(data).then(response => {
                  console.log("DoTransfer - socket response: ",response)
                  io.to(socketID).emit("doTransferReply", JSON.stringify({"data":response}));
                }).catch(error => {
                  io.to(socketID).emit("doTransferReply", JSON.stringify({errorMessage: "check socket logs"}));
                })
              }).catch(error => {
                io.to(socketID).emit("doTransferReply", JSON.stringify({errorMessage: "Failed to receivers accounts with userid"}))
              })
            }).catch(error => {
              io.to(socketID).emit("doTransferReply", JSON.stringify({errorMessage: "Failed to recieve user with mobile number"}))
            })
          }).catch(error => {
            io.to(socketID).emit("doTransferReply", JSON.stringify({errorMessage: "Failed to retrieve accounts"}))
          })
        }).catch(error => {
          io.to(socketID).emit("getSocketTestReply", JSON.stringify({errorMessage: error}));
        })
      })

    })

    return io;
}
