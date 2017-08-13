'use strict';
//var d3ChartG;
/*global define */
requirejs.config({
  "baseUrl": "/lib/d3/d3ext/",
  "paths": {
    "app": "/lib/d3/d3ext/",
    /*global define */
    'moment': '/lib/moment/min/moment.min',
    'underscore': '/lib/underscore/underscore-min'
  }
});//*/

var d3ChartG;
function drawCharts(ctID,chartConfig){
  $('.loader').show();
  require(['d3.chart'], function(d3Chart) {
    d3Chart.init({
      container: '#'+(ctID||'container'),
      xDim: 'DateTime'
    });
    d3ChartG = d3Chart;
    chartConfig.forEach(function(cc){
      //console.log('drawCharts',cc.visible);
      var graph = {
        id: cc.id,
        type: 'analog',
        name: cc.name,
        yVal: [cc.value||'Value'],
        data: cc.data,
        //render:true,
        visible:cc.visible,
        showAvg:false
      };
      //if(cc.lid) graph['lid'] = cc.lid;
      //if(cc.pid) graph['pid'] = cc.pid;
      if(cc.linkto) graph['linkto'] = cc.linkto;
      if(cc.showAvg) graph['showAvg'] = cc.showAvg;

      d3Chart.addGraph(graph);
    });
    d3Chart.render();
    $('.loader').hide();
  });
}

function removeChart(lineId){
  d3ChartG.removeGraph(lineId);
}

function addChart(cc){
  //console.log('addLine');
  if(cc && cc.data.length>2){
    var graph = {
      id: cc.id,
      type: 'analog',
      name: cc.name,
      yVal: [cc.value||'Value'],
      data: cc.data,
      visible:cc.visible
    };
    if(cc.lid) graph['lid'] = cc.lid;
    if(cc.pid) graph['pid'] = cc.pid;
    d3ChartG.addGraph(graph);
    d3ChartG.render();
  }
}

function reorderChart(lineId,updown){
  d3ChartG.reorderGraph(lineId,updown);
}

function removeAllCharts(){
  if(d3ChartG)
    d3ChartG.removeAllCharts();
}

function setChartVisible(chartId,visible){
  d3ChartG.setChartVisible(chartId,visible);
}
