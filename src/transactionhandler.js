const redisClient = require('redis').createClient;

//const serviceLookupHandler = require("./consulLookup.js");

var transactionhandler = (function() {
  var deps = {};

  deps.doTransfer = function(data) {
    return new Promise(
      function(resolve , reject) {
        User.findOne({
            phone: phonenr
        })
        .exec(function(err, user){
          if (err) {
              reject(err);
          } else {
            if (activateUser) {
                user.status = "active";
            } else {
              user.status = "pending_confirmation";
            }
            user.save(function(err, savedUser) {
            if (err) reject(err);
            console.log("saved " + savedUser);
            resolve(savedUser);
            });
          }
        });
      }
    );
  }



  function doTransfer(phonenr, activateUser) {
    return deps.doTransfer(phonenr, activateUser);
  }


return {
    "doTransfer" : doTransfer,
    "deps": deps
  };
})();

module.exports = transactionhandler;
