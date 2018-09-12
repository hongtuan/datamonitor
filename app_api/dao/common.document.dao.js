const _ = require('lodash');
const moment = require('moment');
const defaultTimeFormat = 'YYYY-MM-DD HH:mm:ss';
module.exports.pingMe = function(msg, callback) {
  console.log('msg=', msg);
  if(callback) callback(`pingMe test @${moment().format(defaultTimeFormat)}`);
};

/**
 * 增加文档的通用方法
 * @param Model 文档名
 * @param documentData 文档数据
 * @param callback 完成后的回掉函数
 */
module.exports.createDocument = function(Model, documentData, callback){
  Model.create(documentData, function(err, newDoc) {
    if(err) {
      // console.log(err);
      if(callback) callback(err, null);
      return;
    }
    if(callback) callback(null, newDoc);
  });
};

/**
 * 增加多个文档的通用方法
 * @param Model
 * @param documentDataList 包含多个文档数据的数组对象
 * @param callback 完成后的回掉函数
 */
module.exports.createDocuments = function(Model, documentDataList, callback){
  Model.insertMany(documentDataList, function(err, docs) {
    if(err) {
      // console.log(err);
      if(callback) callback(err, null);
      return;
    }
    if(callback) callback(null, docs);
  });
};

/**
 * 更新文档的通用方法-根据给定的文档id
 * @param Model 定义文档结构的模型
 * @param _id 文档_id
 * @param updateData 通过此参数输入需要更新的文档字段及值{}
 * @param callback 更新完毕后的回掉方法,并返回完整的文档对象。
 * @param onlyReturnUpdated 是否仅返回所更新的列。
 */
module.exports.updateDocumentById = function(Model, _id, updateData, callback, onlyReturnUpdated) {
  const conditions = { _id: _id };
  const update = {};
  _.assign(update, updateData, { updatedOn: Date.now() });
  const options = { new: true };
  if (onlyReturnUpdated) {
    let select = [];
    _.each(updateData, function (value, key) {
      select.push(key);
    });
    options.select = select.join(' ');
  }
  Model.findOneAndUpdate(
    conditions,
    update,
    options,// select:'roleCode roleName,roleType updatedOn',
    function (err, newDocument) {
      // console.log('callback called.', newRoleMenu);
      if(err) {
        // console.log(err);
        if(callback) callback(err, null);
        return;
      }
      if (callback) callback(null, newDocument);
    }
  );
};

/**
 * 更新文档的通用方法--根据给定的筛选条件更新文档,并可以指定需要返回的列。
 * @param Model
 * @param updateOption JSON: {updateFilter: {key: value}, select: 'col1 col2'}
 * @param updateData JSON: {col1: value1, col2: value2}
 * @param callback
 */
module.exports.updateDocument = function(Model, updateOption, updateData, callback){
  const conditions = updateOption.updateFilter;
  const update = {};
  _.assign(update, updateData, { updatedOn: Date.now() });
  const options = { new: true };
  if (updateOption.select) {
    options.select = updateOption.select;
  }
  Model.findOneAndUpdate(
    conditions,
    update,
    options,
    function (err, newDocument) {
      // console.log('callback called.', newRoleMenu);
      if(err) {
        // console.log(err);
        if(callback) callback(err, null);
        return;
      }
      if (callback) callback(null, newDocument);
    }
  );
};


/**
 * 删除文档的通用方法
 * @param Model 要删除文档的模型
 * @param _id 要删除文档的id
 * @param callback 删除后的回掉方法
 */
module.exports.removeDocumentById = function(Model, _id, callback){
  Model.remove({_id: _id}).exec(function(err){
    if(err) {
      // console.log(err);
      if(callback) callback(err,null);
      return;
    }
    if(callback) callback(null,true);
  });
};


module.exports.deleteDocuments = function(Model, queryOption, callback){
  Model.deleteMany(queryOption.filter,(err)=>{
    let deleteCount = queryOption.deleteCount;
    if(err) {
      //console.error(err);
      deleteCount = 0;
      if(callback) callback(err, deleteCount);
      return;
    }
    if(callback) callback(null, deleteCount);
  });
};

module.exports.getDocumentById = function(Model, _id, queryOption,callback) {
  /*Model.findById(_id, function (err, doc) {
      if (err) {
          if (callback) callback(err, null);
          return;
      }
      if (callback) callback(null, doc);
  });*/
  const query = Model.findById(_id);
  if (queryOption.select) {
    query.select(queryOption.select);
  }
  if (queryOption.populate) {
    if (_.isArray(queryOption.populate)) {
      for (let populate of queryOption.populate) {
        query.populate(populate);
      }
    } else {
      query.populate(queryOption.populate);
    }
  }
  query.exec(function (err, doc) {
    if (err) {
      if (callback) callback(err, null);
      return;
    }
    if (callback) callback(null, doc);
  });
};

module.exports.getDocument = function(Model, queryOption, callback) {
  const query = Model.findOne(queryOption.filter || {});
  //*
  if (queryOption.select) {
    query.select(queryOption.select);
  }
  if (queryOption.populate) {
    if (_.isArray(queryOption.populate)) {
      for (let populate of queryOption.populate) {
        query.populate(populate);
      }
    } else {
      query.populate(queryOption.populate);
    }
  }//*/
  query.exec(function (err, doc) {
    if (err) {
      if (callback) callback(err, null);
      return;
    }
    if (callback) callback(null, doc);
  });
};

/**
 * 查询文档的通用方法
 * @param Model
 * @param queryOption {filter:{}, select: '',sort:'',populate: '', limit: 100, page: 1}
 * @param callback
 */
module.exports.getDocuments = function(Model, queryOption, callback){
  // const countQuery = Model.find(queryOption.filter||{});
  let start = 1;
  const query = Model.find(queryOption.filter||{});
  if (queryOption.select) {
    query.select(queryOption.select);
  }
  if (queryOption.page && queryOption.limit) {
    const perPage = +queryOption.limit;
    const crtPage = +queryOption.page;
    start = (crtPage - 1) * perPage;
    query.skip(start);
  }
  if (queryOption.limit) {
    query.limit(+queryOption.limit);
  }
  if (queryOption.sort) {
    query.sort(queryOption.sort);
  }
  if (queryOption.populate) {
    if (_.isArray(queryOption.populate)){
      for (let populate of queryOption.populate) {
        query.populate(populate);
      }
    }else {
      query.populate(queryOption.populate);
    }
  }

  // 根据是否需要分页来执行不同的查询。
  if (queryOption.needPaging) {
    // 先查询总行数，然后查询行数据，并封装后返回。
    Model.count(queryOption.filter||{}).exec(function (err1, count) {
      if (err1) {
        if (callback) callback(err1, null);
        return;
      }
      query.lean().exec(function(err2,rows){
        if(err2) {
          if (callback) callback(err2, null);
          return;
        }
        let i = start + 1;
        _.each(rows, function (row) {
          row._rid = i++;
        });
        if (callback) callback(null, { totalCount: count, rows: rows});
      });
    });
  }else {
    // 直接查询行数据返回即可
    query.lean().exec(function(err,rows){
      if(err) {
        if (callback) callback(err, null);
        return;
      }
      let i = 1;
      _.each(rows, function (row) {
        row._rid = i++;
      });
      if (callback) callback(null, { rows: rows});
    });
  }
};
