//var superagent = require('superagent');
var http = require('http');
var iconv = require('iconv-lite');
var fs = require('fs');
var path = require('path');
var moment = require('moment');
//argv cool!
var argv = require('yargs')
    .usage('Usage: $0 -f [string] -t [string]')
    .option('t', {
      alias: 'task',
      describe: 'choose a task',
      choices: ['gl', 'gc', 'ga']
    })
    .default({ f : 'spider.json'})
    .demand(['f','t'])
    .argv;
    
function getUrlContent(url,cb,encode){
  http.get(url, function(urlContent) {
    urlContent.pipe(iconv.decodeStream(encode||'gb2312'))
      .collect(function(err, decodeContent) {
        if(err) {
          console.error(err);
          decodeContent = '';
        }
        if(cb) cb(decodeContent);
      });
  });
}

function getPageList(indexUrl,indexReg,cb,encode){
  getUrlContent(indexUrl,function(content){
    //console.log(content);
    var regex = new RegExp(indexReg,'g');
    var pageList = [];
    var regMatchRes = null;
    do {
      regMatchRes = regex.exec(content);
      if(Array.isArray(regMatchRes)){
        pageList.push({url:regMatchRes[1],title:regMatchRes[2]});
      }
    } while(regMatchRes != null);
    if(cb) cb(pageList);
  },encode);
}

function cvtContent(pageContent){
  //remove ?
  pageContent = pageContent.replace(/\?/,'');
  //remove space             
  pageContent = pageContent.replace(/^\s*/g,'');
  pageContent = pageContent.replace(/&nbsp;&nbsp;&nbsp;&nbsp;\[燃\^文\^书库\]\[www\]\.\[774\]\[buy\]\.\[\]&nbsp;&nbsp;&nbsp;&nbsp;/,'');
  pageContent = pageContent.replace(/\s/g,'');
  pageContent = pageContent.replace(/&nbsp;/g,' ');
  pageContent = pageContent.replace(/<br\/><br\/>/g,'<br\/>');
  pageContent = pageContent.replace(/<br\s\/><br\s\/>/g,'<br\/>');
  pageContent = pageContent.replace(/<br\s\/>/g,'\r\n');
  pageContent = pageContent.replace(/<br\/>/g,'\r\n');
  pageContent = pageContent.replace(/<br>/g,'\r\n');
  pageContent = pageContent.replace(/<BR>/g,'\r\n');
  pageContent = pageContent.replace(/<P>/g,'');
  pageContent = pageContent.replace(/<p>/g,'');
  pageContent = pageContent.replace(/<!--flag016-->/,'');
  pageContent = pageContent.replace(/U.*?\(.*?\)/,'');
  //pageContent = pageContent.replace(/看书\(.\)/g,' ');
  return pageContent;
}

function parserContent(url,contentReg,cb,encode){
  getUrlContent(url,function(content){
    //remove \r\n,very important!
    content = content.replace(/[\r\n]/g, ''); 
    var regex = new RegExp(contentReg,'g');
    var storyContent = '';
    var regMatchRes = null;
    regMatchRes = regex.exec(content);
    if(Array.isArray(regMatchRes)){
      //console.log(regMatchRes.length);
      storyContent = regMatchRes.slice(1).join('<br/>');
      //console.log(storyContent);
    }
    if(storyContent != ''){
      storyContent = cvtContent(storyContent);
    }
    if(cb) cb(storyContent);
  },encode);
}

function getPageContent(urlPre,pageItem,pageReg,cb,encode){
  //build pagecontent url from urlPre
  var url = urlPre+pageItem.url;
  var start = Date.now();
  parserContent(url,pageReg,function(pageContent){
    if(pageContent==''){
      pageContent = '['+pageItem.title+'] get failed:-(';
      console.warn(pageContent);
    }
    pageItem['content'] = pageContent;
    var logInfo = 'Get['+pageItem.title+'] from ['+url+'] ok,use time:('+(Date.now()-start)+').';
    console.log(logInfo);
    if(cb) cb(logInfo);
  },encode);
}

function appendInfo2File(file,info){
  /*
  fs.appendFile(file,info+'\r\n', function(err){
    if(err) console.log("appendFile file fail:" + err);
  });//*/
  //Sync append.
  fs.appendFileSync(file,info+'\r\n\r\n');
}

function getFileObj(fileName){
  //append .txt
  if(!fileName.endsWith('.txt')) fileName+='.txt';
  var fileObj = path.join(__dirname,fileName||'story.txt');
  /*
  if(fs.existsSync(fileObj)){
    fs.unlinkSync(fileObj);
    console.log("File ["+fileObj+"] deleted successfully!");
  }//*/
  //*
  fs.exists(fileObj, function(exists) {
    if(exists) {
      //Show in green
      console.log('File exists. Deleting now ...');
      fs.unlink(fileObj, function(err) {
        if (err) {
          return console.error(err);
        }
        console.log("File ["+fileObj+"] deleted successfully!");
      });
    } else {
      //Show in red
      console.log('File not found, so just create one.');
    }
  });//*/
  return fileObj;
}


function loadTextContent(pathname) {
  if(fs.existsSync(pathname)){
    var bin = fs.readFileSync(pathname);
    //do with utf8+
    if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
      bin = bin.slice(3);
    }
    return bin.toString('utf-8');
  }else{
    console.log(pathname+' not exists.');
    return null;
  }
}

//console.log("The config file is:", argv.f);
var fc = loadTextContent(argv.f);
if(fc == null) return;
//console.log('config file content:\n'+fc);
//parser filecontent.
var sc = JSON.parse(fc);
console.log('config file['+argv.f+'] parserd content:\n'+JSON.stringify(sc,null,2));

var indexUrl = sc.indexUrl.replace('{baseUrl}',sc.baseUrl);
indexUrl = indexUrl.replace('{storyNum}',sc.storyNum);
console.log('indexUrl='+indexUrl);

var indexReg = sc.indexReg.replace('{storyNum}',sc.storyNum);
console.log('indexReg='+indexReg);

var contentTestUrl = sc.contentTestUrl.replace('{baseUrl}',sc.baseUrl);
contentTestUrl = contentTestUrl.replace('{storyNum}',sc.storyNum);
console.log('contentTestUrl='+contentTestUrl);
switch(argv.t){
  case 'gl':
    console.log('Get page list test here...');
    getPageList(indexUrl,indexReg,function(pageList){
      if(Array.isArray(pageList)){
        if(pageList.length == 0) {
          console.log('Get page list failed.');
          return;
        }
        pageList.forEach(function(page){
          console.log(page.url,page.title);
        });
        console.log('Get page list successful. total count is '+pageList.length);
        //here can do getContent task
        console.log('Test to get:'+pageList[0].url,pageList[0].title);
        parserContent(indexUrl+pageList[0].url,sc.contentReg,function(storyContent){
          if(storyContent!=''){
            console.log(storyContent);
            console.log('Cool!get content test ok.');
          }else{
            console.log('Get content test faild.');
          }
        },sc.encode);
      }else{
        console.log('Get page list failed.');
      }
    },sc.encode);
    break;
  case 'gc':
    console.log('Get content test here...');
    parserContent(contentTestUrl,sc.contentReg,function(storyContent){
      if(storyContent!=''){
        console.log(storyContent);
        console.log('Cool!get content test ok.');
      }else{
        console.log('Get content test faild.');
      }
    },sc.encode);
    //var pageItem = {url:'79571.html',};
    //getPageContent(sc.indexUrl,pageItem,pageReg,cb,encode);
    break;
  case 'ga':
    console.log('Get all conetents  here...');
    getPageList(indexUrl,indexReg,function(pageList){
      if(Array.isArray(pageList)){
        var totalPageCount = pageList.length;
        console.log('TotalPageCount='+totalPageCount);
        if(sc.contentOffset && sc.contentOffset>0){
          totalPageCount -= sc.contentOffset;
        }
        console.log('Begin to get pagecontent...');
        console.log('Get PageCount='+totalPageCount);
        var finishedPageCount = 0;
        var logFile = getFileObj('runLog.txt');
        //var outFile = getFileObj(sc.outFile||sc.storyNum|| sc.storyName ||'contentOut.txt');
        var outFile = getFileObj('s_'+sc.storyNum);
        for(var i=0;i<totalPageCount;i++){
          (function(lockedIndex) {
            //delay a few time to get each page.
            var delay = 500*lockedIndex+Math.floor(Math.random()*300);
            console.log('delay='+delay);
            setTimeout(function(){
              getPageContent(indexUrl,pageList[lockedIndex],sc.contentReg,function(logInfo){
                finishedPageCount++;
                appendInfo2File(logFile,logInfo);
                var finishInfo = 'lockedIndex='+lockedIndex+',['+finishedPageCount+'/'+totalPageCount+'] pages get over.';
                appendInfo2File(logFile,finishInfo);
                console.log(finishInfo);
                if(finishedPageCount >= totalPageCount){
                  console.log('All page get over,begin to write file...');
                  if(sc.reverseIndexOrder){
                    for(var j= totalPageCount-1;j>=0;j--){
                      appendInfo2File(outFile,pageList[j].content);
                    }
                  }else{
                    for(var j = 0;j<totalPageCount;j++){
                      appendInfo2File(outFile,pageList[j].content);
                    }
                  }
                  appendInfo2File(outFile,'\r\n update over @'+moment(Date.now()).format('LLLL'));
                  console.log('File ['+outFile+'] write over.');
                  //process.exit();
                }
              });
            },delay);
          })(i);
        }//--end for
      }
    });
    break;
}
