!function(){
  var ndCharts = {};
  var margin = {top: 20, right: 80, bottom: 30, left: 50},
    svgWidth=400,
    svgHeight=300.
    _container;
    
  var svg,g,width,height;
  //var parseTime = d3.timeParse("%Y%m%d");
  //var parseTime = d3.isoParse();
  //var isoTimeParse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
  var parseTime = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
  var x = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([height, 0]),
      z = d3.scaleOrdinal(d3.schemeCategory10);
  
  var line = d3.line()
      .curve(d3.curveBasis)
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.temperature); });
  
  ndCharts.init = function(cid,w,h){
    _container='#'+cid;
    svg = d3.select(_container).append("svg")
      .attr("width", w||svgWidth).attr("height", h||svgHeight)
      .style("border", "1px solid white");
    g = svg.append("g").attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");
    width = svg.attr("width") - margin.left - margin.right;
    height = svg.attr("height") - margin.top - margin.bottom;
  };
  
  ndCharts.drawAll = function(){
    
  };
  
  ndCharts.hideChart = function(cid){
    
  };
  
  ndCharts.showChart = function(){
    
  };
  this.ndCharts = ndCharts;
}();
