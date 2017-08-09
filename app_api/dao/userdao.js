var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.appendLoc2User = function(lid,uid, cb) {
  //console.log(lid,uid);
  User.findById(uid).select('loclist').exec(function(err,user){
    if(err){
      console.error(err);
      if(cb) cb(err,null);
      return;
    }
    user.loclist.push(lid);
    user.save(function(err,updatedUser){
      if(err){
        console.error(err);
        if(cb) cb(err,null);
        return;
      }
      //console.log('cool!');
      if(cb) cb(null,updatedUser);
    });
  });
};

module.exports.getUserLocList = function(uid, cb) {
  //console.log(lid,uid);
  User.findById(uid).select('loclist').exec(function(err,user){
    if(err){
      console.error(err);
      if(cb) cb(err,null);
      return;
    }
    //console.log('cool!');
    if(cb) cb(null,user.loclist);
  });
};

