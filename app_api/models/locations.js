/**
* model define of location
**/
var mongoose = require('mongoose');
/*
var sensorDataSchema = new mongoose.Schema({
    soid: {type: String, required: true},
    data:[{name: String, value: Number }],
    collectedOn: {
      type: Date,
      default: Date.now
    }
});//*/

var LogSchema = new mongoose.Schema({
  logContent:String,
  createdOn: {
    type: Date,
    default: Date.now
  }
});

var LocationLogSchema = new mongoose.Schema({
  locid:{type: String, required: true},
  logType:{type: String, required: true},
  logList:[LogSchema]
});

var nodeDataSchema = new mongoose.Schema({
  locid:String,
  pid: String,
  nodeid: {type: String, required: true},
  //data:[{name: String, value: Number,_id:false }],
  data:[{}],
  collectedOn: {
    type: Date,
    default: Date.now
  }
});

var pointSchema = new mongoose.Schema({
  coords: String,//40.232323,-80.898998
  nodeid: String,
  ptag:String,
  installedOn: {
    type: Date,
    default: Date.now
  },
  //latestdata:[{name: String, value: Number,_id:false }],
  latestdata:[{}],
  latestdatatime:{ type: Date },
  status:{type:String,default:'1'},
  notes:[{nc:String,ntime:{type: Date,default: Date.now,_id:false}}],
  mgrlog:[{}],
  updatedOn: {
    type: Date,
    default: Date.now
  }
});

var boundarySchema = new mongoose.Schema({
  btype: {
    type: Number,
    default:1,
    required: true
  },
  bname:{
    type:String,
    default:'unNamed'
  },
  //bdelimit:String,
  bdelimit:{},
  status:{type:String,default:'1'},
  createdOn: {
    type: Date,
    default: Date.now
  },
  updatedOn: {
    type: Date,
    default: Date.now
  },
  points:[pointSchema]
});

var locationSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  ctpos: {
    type:String,
    default:'42.345858,-87.885888'
  },
  gwpos: {
    type:String,
    default:'42.345858,-87.885888'
  },
  datasrc:{type:String,default:'C47F51001099'},
  snapcount:{type:Number,default:3},
  status:{type:String,default:'1'},
  contentbrief:{},
  synperiod:{
    type: Number,
    default: 0
  },
  monitperiod:{
    type: Number,
    default: 600
  },
  //alertpolices: {},
  alertPolicy: [{}],
  createdOn: {
    type: Date,
    default: Date.now
  },
  updatedOn: {
    type: Date,
    default: Date.now
  },
  latestDataOn: {
    type: Date,
    default: '2017-03-15T00:00:00.108Z'
    //expires: 60*60*24
  },
  address:{type:String,default:''},
  contactInfo:{type:String,default:''},
  emails:{type:String,default:''},
  isAutoSyn:{type:Boolean,default:false},
  notes:[{nc:String,ntime:{type: Date,default: Date.now,_id:false}}],
  datalogs:[{dlc:String,ltime:{type: Date,default: Date.now,_id:false}}],
  boundaries: [boundarySchema],
  freeNodes:[pointSchema]
});

mongoose.model('Location', locationSchema);
mongoose.model('NodeData', nodeDataSchema);
mongoose.model('LocationLog', LocationLogSchema);
