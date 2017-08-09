var mongoose = require( 'mongoose' );
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  hash: String,
  salt: String,
  /* role
  *root:supperUser(allow mgr all location,can access user mgr module.),
  *  can remain a default root user,for recover:-)
  admin:admin(allow mgr some locations,include add location,deploy,monitor them),
  view:monitorUser,allow monitor some locations,just monitor them.
  */
  role:{type:String,default:'view'},
  loclist:[String],
  createdOn: {
    type: Date,
    default: Date.now
  },
  expiredOn: {
    type: Date,
    default: Date.now
  },
  logList:[{}]
});

userSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
};

userSchema.methods.validPassword = function(password) {
  //console.log('password',password,JSON.stringify(this));
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 1);//

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    loclist:this.loclist,
    expiredOn:this.expiredOn,
    exp: parseInt(expiry.getTime() / 1000,10),
  }, process.env.JWT_SECRET); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

mongoose.model('User', userSchema);
