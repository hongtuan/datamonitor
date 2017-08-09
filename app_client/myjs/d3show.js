//console.log('nid='+nid);
/*
var dataDesc = {
  SS:"Singal Streath",
  SC:"Super Cap Voltage",
  AH:"Ambient Humidity",
  RH:"Roof Humidity",
  DH:"Delta Humidity",
  TP:"Temperature",
  FS:"Fan Speed",
  FC:"FanCounts",
  FD:"FanData"
};//*/
var dataDesc = {};
var svg = d3.select("svg"),
  //margin = {top: 20,right: 20,bottom: 30,left: 50},
  margin = {top: 3,right: 10,bottom: 30,left: 40},
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom,
  bisectDate = d3.bisector(function(d) { return d.date; }).left,
  formatValue = d3.format(",.2f"),
  formatCurrency = function(d) { return formatValue(d); },
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var x = d3.scaleTime().rangeRound([0, width]);
var y = d3.scaleLinear().rangeRound([height, 0]);

var data;
function drawLine(dataName){
  clearView();
  var line = d3.line()
    .x(function(d) {
      return x(d.date);
    })
    .y(function(d) {
      return y(d[dataName||'SC']);
    });
  
  data.sort(function(a, b) {
    return a.date - b.date;
  });
    
  var x_min = d3.min(data, function(d) {
    return d.date;
  });
  
  var x_max = d3.max(data, function(d) {
    return d.date;
  });
  
  x.domain([x_min, x_max]);
  //x.domain([data[0].date, data[data.length - 1].date]);
  /*
  x.domain(d3.extent(data, function(d) {
    return d.date;
  }));//*/
  
  
  var y_min = d3.min(data, function(d) {
    return d[dataName||'SC'];
  });
  var y_max = d3.max(data, function(d) {
    return d[dataName||'SC'];
  });
  if(y_min == y_max && y_max>0) {
    y_min = 0;
    //y_max +=0.1*y_max;
  }
  y.domain([y_min,y_max]);

  /*
  y.domain(d3.extent(data, function(d) {
    return d[dataName||'SC'];
  }));//*/
  
  //y.domain([0, d3.max(data, function(d) { return d.close; })]);
  //y.domain([0, d3.extent(data, function(d) { d[dataName||'SC']; })]);

  g.append("g")
    //.attr("class", "axis axis--x")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
    //.call(xAxis);

  g.append("g")
    //.attr("class", "axis axis--y")
    .attr("class", "y axis")
    .call(d3.axisLeft(y))
    //.call(yAxis)
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .style("text-anchor", "end")
    .text(dataDesc[dataName||'SC']);
  //*
  g.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);//*/
  
  var focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
      .attr("r", 4.5);

  focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

  svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + x(d.date) + "," + y(d[dataName||'SC']) + ")");
    focus.select("text").text(formatCurrency(d[dataName||'SC']));
  }
}

function clearView(){
  svg.selectAll("path").remove();
  g.selectAll("g").remove();
}

function getScriptParams(){
  var scripts = document.getElementsByTagName('script');
  var crtScript = scripts[scripts.length - 1];
  var crtScriptSrc = crtScript.src;
  var queryStr = crtScriptSrc.substring(crtScriptSrc.indexOf('?')+1);
  var queryparams = {};
  queryStr.split('&').forEach(function(kv){
    var ta = kv.split('=');
    queryparams[ta[0]] = ta[1];
  });
  return queryparams;
}

//console.log(JSON.stringify(parames,null,2));
//console.log('nid='+queryparams['nid']);
var queryparams = getScriptParams();
//call json.
//d3.json('/api/nd/getnd/'+queryparams['nid'], function(rawDataList) {
var lid = queryparams['lid'];
var nid = queryparams['nid'];
d3.json(`/api/nd/getnd/${lid}/${nid}`, function(nodeData) {
  var da = nodeData.da;
  for(var pro in da){
    dataDesc[pro] = da[pro].desc;
  }
  if (Array.isArray(nodeData.dataList)) {
    var cvtData = [];
    nodeData.dataList.forEach(function(nd) {
      var d = {
        date: d3.isoParse(nd.dataTime),
      };
      var nvl = nd.data.split(',');
      nvl.forEach(function(nv){
        var ta = nv.split(':');
        d[ta[0]] = +ta[1];
      });
      cvtData.push(d);
    });
    //console.log(JSON.stringify(cvtData,null,2));
    data = cvtData;
    if(data.length>1)
      drawLine();
  }
});

