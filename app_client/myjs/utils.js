/**
* map uitl js lib by Tim @ USA
**/

function convertUTCDateToLocalDate(date,_tzo) {
  console.log('date='+date.toLocaleString());
  var tzo = _tzo||date.getTimezoneOffset();
  //console.log('tzo='+tzo);
  var newDate = new Date(date.getTime()+tzo*60*1000);
  var offset = tzo / 60;
  var hours = date.getHours();
  newDate.setHours(hours - offset);
  return newDate;   
}

function cvtUTCStr2LocStr(str,_tzo){
  var dateObj = new Date(str);
  return convertUTCDateToLocalDate(dateObj,_tzo).toLocaleString();
  //return convertUTCDateToLocalDate(dateObj,_tzo).toString();
}

function iso2Locale(isoDateStr){
  return new Date(isoDateStr).toLocaleString('en-US');
}

function iso2LocaleDate(isoDateStr){
  return new Date(isoDateStr).toLocaleDateString('en-US');
}

function iso2LocaleTime(isoDateStr){
  return new Date(isoDateStr).toLocaleTimeString('en-US');
}

function sortArrayByAttr(array, attr,order) {
  return array.sort(function(a, b) {
    var x = a[attr];
    var y = b[attr];
    //return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    return (order||'asc')=='asc'?
      (((x < y) ? -1 : ((x > y) ? 1 : 0))):
      (((x > y) ? -1 : ((x < y) ? 1 : 0)));
  });
}

/**
 * add hashCode method from String Object
 * */
if(!String.prototype.hashCode){
  String.prototype.hashCode = function() {
  	var hash = 0, i = 0, len = this.length;
     while ( i < len ) {
  		hash  = ((hash << 5) - hash + this.charCodeAt(i++)) << 0;
     }
     return hash;
  };
}

/**
 * replaceAll
 * add replaceAll method for String
 * */
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(target, replacement) {
    return this.split(target).join(replacement);
  };
}

/*
if (!Array.prototype.removeItem) {
  Array.prototype.removeItem = function(item) {
    //console.log('target',JSON.stringify(target));
    //console.log('this',JSON.stringify(this));
    var index = this.indexOf(item);
    //console.log('index=',index);
    if(index == -1) return;
    //target = this.splice(target,index,1);
    //console.log(2,JSON.stringify(target));
    //this = target;
    //return 
    this.splice(index,1);
  };
}//*/

function removeArrayItem(a,item){
  var index = a.indexOf(item);
  if(index == -1) return a;
  return a.splice(index,1);
}

/**
 * add format method for String
 * useage:
 * var myStr = 'This is an {0} for {0} purposes: {1}';
 * alert(myStr.format('example', 'end'));
 * */
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    });
  };
}

$(function () {
  $.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  }
});


/**
* remove char at i
**/
function removeAt(s,i) {
	s = s.substring(0,i)+s.substring(i+1,s.length);
	return s;
}
/**
* round to p 4~5!
**/
function roundnum(x,p) {
 	var n=parseFloat(x);
	//var m=n.toPrecision(p+1);
	var m=n.toFixed(p);
	var y=String(m);
	//*
	var i=y.length;
	var j=y.indexOf('.');
	if(i>j && j!=-1) {
		while(i>0) {
			if(y.charAt(--i)=='0')
				y = removeAt(y,i);
			else
				break;
		}
		if(y.charAt(i)=='.')
			y = removeAt(y,i);
	}//*/
	return y;
}



function ft2m(x){
  var y = parseFloat(x)/3.2808;
  //return parseFloat(roundnum(y,2));
  //return Math.round(y*100.0)/100.0;//.toFixed(5);
  return y;
}

function sm2sft(x){
  var y=x*3.2808*3.2808;
  return Math.round(y*100.0)/100.0;//.toFixed(5);
}

function m2ft(x){
  var y = 3.2808*x;
  //return Math.round(y*100.0)/100.0;//.toFixed(5);
  return y;
}

/**
* remain 10
**/
function roundresult(x) {
 	var y = parseFloat(x);
 	y = roundnum(y,10);
 	return y;
}

function getUserInfo(){
  //var userInfoInLocalStorage = window.localStorage[this.userInfoKey];
  var userInfo = JSON.parse(window.localStorage['rsApp-userInfo']);
  //console.log('getUserInfo:'+JSON.stringify(userInfo,null,2));
  return userInfo?userInfo:{};
}

function json2Str(jsonObj){
  var tmpA = [];
  for(var key in jsonObj){
    tmpA.push(`${key}:${jsonObj[key]}`);
  }
  return tmpA.join(',');
}

function downloadFile(fileContentUrl){
  $("<iframe/>").attr({
    src: fileContentUrl,
    style: "visibility:hidden;display:none"
  }).appendTo('body');
}
