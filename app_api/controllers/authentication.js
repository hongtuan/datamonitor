var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
//var util = require('../../utils/util');
var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function(req, res) {
  if(!req.body.name || !req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }

  var user = new User();

  user.name = req.body.name;
  user.email = req.body.email;
  user.role = req.body.role;
  user.loclist = req.body.loclist;
  user.expiredOn = req.body.expiredOn;

  user.setPassword(req.body.password);

  user.save(function(err,savedUser) {
    if (err) {
      //sendJSONresponse(res, 404, err);
      res.status(406).json(err);
    } else {
      var token = user.generateJwt();
      //sendJSONresponse(res, 200, {"token" : token});
      //sendJSONresponse(res, 200, user);
      res.status(200).json(user);
    }
  });
};

module.exports.updateUser = function(req, res) {
  if(!req.body.name || !req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }
  var uid = req.params.uid;
  //console.log('uid='+uid);
  //var user = User.where({_id:uid});why 500?!
  //console.log('user='+JSON.stringify(user));
  
  //console.log('uid='+uid);
  User.findById(uid).select('email name hash salt').exec(function(err, user){
    if(err){
      //console.log(err);
      res.status(404).json('uid['+uid+'] not found.'+err);
      return;
    }
    //console.log('before update:'+JSON.stringify(user));
    user.email = req.body.email;
    user.name = req.body.name;
    user.loclist = req.body.loclist;
    user.expiredOn = req.body.expiredOn;
    
    user.setPassword(req.body.password);
    //console.log('before save:'+JSON.stringify(user));
    user.save(function(err, user){
      if(err){
        console.log(err);
        res.status(406).json(err);
        return;
      }
      //console.log('save over.');
      //console.log('after update:'+JSON.stringify(user));
      res.status(200).json(user);
    });
  });
};

module.exports.login = function(req, res) {
  console.log(JSON.stringify(req.body));
  if(!req.body.email || !req.body.password) {
    res.status(400).json({
      "message": "All fields required"
    });
    return;
  }

  passport.authenticate('local', function(err, user, info){
    //console.log('info:'+JSON.stringify(info));
    var token;
    if (err) {
      res.status(404).json(err);
      return;
    }
    res.setHeader('Access-Control-Allow-Origin','*');
    if(user){
      //need check expiredOn here
      var expiredOn = new Date(user.expiredOn).getTime();
      var crtDateTime = Date.now();
      if(crtDateTime<expiredOn){
        token = user.generateJwt();
        res.status(200).json({"token" : token});
      }else{
        res.status(401).json("you account has expiredOn "+new Date(user.expiredOn).toLocaleDateString());
      }
    } else {
      //res.status(401).json(`email or password not correct,${info}`);
      res.status(401).json(info);
    }
  })(req, res);
};


module.exports.userList = function(req, res) {
  User.find({email:{"$ne":"timtian@gmail.com"}}).limit(10).sort('-createdOn').
  //User.find().limit(10).sort('-createdOn').
    select('id email name role hash salt createdOn expiredOn loclist').
    exec(function(err, rows) {
      //console.log('rows='+rows);
      if (err) {
        console.log(err);
        res.status(400).json(err);
      }
      res.status(200).json(rows);
    });
};


module.exports.deleteUser = function(req, res) {
  //console.log('api controllers===req.params.uid='+req.params.uid);
  var uid = req.params.uid;
  if (uid) {
    User.findByIdAndRemove(uid).exec(function(err, user) {
      if (err) {
        console.log(err);
        res.status(404).json(err);
        return;
      }
      //console.log('user='+user);
      console.log("User id " + uid + " deleted");
      //res.status(200).json('canot delete!');
      res.status(200).json('success');
    });
  }
};

