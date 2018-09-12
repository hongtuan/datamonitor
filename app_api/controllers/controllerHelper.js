//const logger = require("../config/logger.lib");
const commonDao = require('../dao/common.document.dao');
const _ = require('lodash');

function buildQueryOption (req,res) {
  const queryOption = { needPaging: true };
  const queryParam = req.query;
  // const filter = {status:1};
  const filter = {};
  // introduction_like=look&reqType_like=ge&_page=1&_limit=40
  _.each(queryParam,function(value, key) {
    if (_.endsWith(key, '_like')) {
      filter[_.split(key,'_')[0]] = new RegExp(value);
    }
  });
  queryOption.filter = filter;
  // ?_sort=createdOn&_order=ASC&_page=1&_limit=40
  if (queryParam.hasOwnProperty('_sort') && queryParam.hasOwnProperty('_order')) {
    queryOption.sort = (queryParam._order!=='ASC'?'-':'') + queryParam._sort;
  }
  if (queryParam.hasOwnProperty('_limit')) {
    queryOption.limit = queryParam._limit;
  }
  if (queryParam.hasOwnProperty('_page')) {
    queryOption.page = queryParam._page;
  }
  return queryOption;
}

module.exports.buildQueryOption = function (req,res) {
  return buildQueryOption(req, res);
};

module.exports.outValidationErrors = function (req, res) {
  req.getValidationResult().then((err) => {
    //logger.system().warn('invalidInput',JSON.stringify(err.array()));
    //logger.getLogger('database').info('invalidInput',err.array());
    res.status(400).json({invalidInput:err.array()});
  });
};

module.exports.createDocument = function (req, res, Model, doc) {
  commonDao.createDocument(Model, doc, function (err, newDoc) {
    if (err) {
      console.log(err);
      res.status(500).json(err);
      return;
    }
    res.status(201).json(newDoc);
  });
};



module.exports.removeDocumentById = function(req, res, Model, _id){
  commonDao.removeDocumentById(Model, _id, function(err, removeSuccess) {
    if (err) {
      console.log(err);
      //res.status(404).json(err);
      res.status(500).json(err);
    }
    res.status(200).json({success: removeSuccess});
  });
};

module.exports.updateDocumentById = function(req, res, Model, _id, updateData, onlyReturnUpdated) {
  commonDao.updateDocumentById(Model, _id, updateData, function (err, newDoc) {
    if (err) {
      console.log(err);
      res.status(500).json(err);
    }
    res.status(200).json(newDoc);
  }, onlyReturnUpdated);
};

module.exports.updateDocument = function(req, res, Model, updateOption, updateData){
  commonDao.updateDocument(Model, updateOption, updateData, function (err, newDoc) {
    if (err) {
      console.log(err);
      res.status(500).json(err);
    }
    res.status(200).json(newDoc);
  });
};

module.exports.getDocumentById = function(req, res, Model, _id, queryOption){
  commonDao.getDocumentById(Model, _id, queryOption,function (err, doc) {
    if (err) {
      console.log(err);
      res.status(500).json(err);
    }
    res.status(200).json(doc);
  });
};

module.exports.getDocuments = function(req, res, Model, queryOption){
  const _queryOption = buildQueryOption(req, res);
  if (queryOption) {
    _.assign(_queryOption, queryOption);
  }
  commonDao.getDocuments(Model, _queryOption, function (err, docList) {
    if (err) {
      console.log(err);
      res.status(500).json(err);
    }
    res.status(200).json(docList);
  });
};

module.exports.getDocumentList = function(Model, queryOption, callback){
  commonDao.getDocuments(Model, queryOption, function (err, result) {
    if (err) {
      console.error(err);
      if(callback) callback(err,null);
      return;
    }
    if(callback) callback(null,result);
  });
};

module.exports.createDocuments = function (Model, docList, callback) {
  commonDao.createDocuments(Model, docList, function (err, docs) {
    if (err) {
      console.log(err);
      if(callback) callback(err,null);
      return;
    }
    if(callback) callback(null,docs);
  });
};
