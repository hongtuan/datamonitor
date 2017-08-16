/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//define(['moment', 'underscore', 'd3.chart.analog', 'd3.chart.digital', 'd3.chart.horizon'], function (moment) {
//define(['moment', 'underscore', 'd3.chart.analog', 'd3.chart.digital', 'd3.chart.horizon'], function(moment) {
define(['moment', 'underscore', 'd3.chart.analog'], function(moment) {

  var _container, _graphs = [];

  //chart d3 config
  var _svgContainer, _chartCanvas, _xScale, _xDomain = [Infinity, -Infinity];

  //static config
  //var containerWidth = 800, containerHeight = 400;
  var containerWidth = 600,
    containerHeight = 300;
  var margin = {
      top: 40,//40
      right: 50,
      bottom: 0,//30
      left: 50 //60
    },
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;
  var logChartHeight = 100,
    diChartHeight = 20;
  var gap = 30;
  //var color = d3.scale.category10();
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  this.init = function(options) {

    _container = options.container;
    containerWidth = $(_container).width();
    width = containerWidth - margin.left - margin.right;

    _svgContainer = d3.select(_container)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight);
//*
    _svgContainer.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);//*/

    _chartCanvas = _svgContainer
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set up the X Axis scale
    //_xScale = d3.time.scale().range([0, width]);
    _xScale = d3.scaleTime().range([0, width]);

    var hoverLine = _chartCanvas.append('svg:line')
      .attr('class', 'hover-line')
      .attr('x1', 20).attr('x2', 20)
      .attr('y1', 2) // prevent touching x-axis line
      //.attr('y2', height + 20)
      .attr('y2', height)
      .attr('transform', 'translate(0, -20)')
      .attr('stroke-width', 1)
      .attr('stroke', 'grey')
      .attr('opacity', 1e-6);

    _chartCanvas.append("g")
      .attr('id', 'xAxis')
      .attr('transform', 'translate(0, -20)') // putting x-Axis into the margin area
      .attr("class", "brush");
    _chartCanvas.select('#xAxis').append('g') // where x-axis will be rendered
      .attr("class", "x axis");


    var timeLegend = _chartCanvas.append('text')
      .attr('class', 'legend-time')
      .attr('x', width)
      .attr('y', -5) // push to the margin area below x-axis
      .attr('text-anchor', 'end')
      .text('time:');

    var timeLegendML = _chartCanvas.append('text')
      .attr('class', 'legend-time')
      .attr('x', width)
      .attr('y', 10) // push to the margin area below x-axis
      .attr('text-anchor', 'end')
      .text('');

    var dataCountText = _chartCanvas.append('text')
      .attr('class', 'legend-time')
      .attr('x', width)
      .attr('y', 10) // push to the margin area below x-axis
      .attr('text-anchor', 'end')
      .text('dataCount');

    function updateHLValue() {
      var mouse = d3.mouse(this);
      var mX = mouse[0] - margin.left,
        mY = mouse[1] - margin.top;
      //hoverLine.attr('x1', mX).attr('x2', mX);
      if (mX > 0 && mY > 0 && mX < width) {
        var dt = _xScale.invert(mX);
        //console.log(mX,dt);
        var nearestDateVal = minDistanceDate(_.map(_graphs, function(d) {
          return d.map[mX] ? d.map[mX].date : null;
        }), dt);
        var graphIdswithDataAtNearestDate = _.chain(_graphs).filter(function(d) {
          return d.map[mX] && d.map[mX].date == nearestDateVal;
        }).pluck('id').value();
        if (nearestDateVal != null) {
          var xMoment = moment(nearestDateVal);
          var moveX = _xScale(xMoment);
          var dataCount = 0;
          //update legend values
          d3.selectAll('.graph').data(_graphs, function(d) {
            return d.id;
          }).each(function(d) {
            //console.log(d.y);
            var g = d3.select(this);
            var dataValue = '';
            //var v = _.findWhere(d.data, { DateTime: nearestDateVal });
            if (graphIdswithDataAtNearestDate.indexOf(d.id) >= 0) {
              var v = d.data[d.map[mX].idx];
              _.each(d.yVal, function(yDim, i) {
                //console.log(yDim,i);
                dataValue += d.yVal.length == 1 ? v[yDim] : ((i > 0 ? ', ' : ' ') + yDim + ':' + v[yDim]);
              });
              //show data value around dot.
              //g.select('.dvtext').text(dataValue).attr('x', moveX).attr('y', 30+100*(d.order+1)-(+dataValue));
              g.select('.dvtext').text(dataValue).attr('x', moveX);//.attr('y', (+dataValue));

              //console.log(g.select('.dvtext').attr('y'));
            }
            //dataCount += dataValue != ''?1:0;
            //g.select('.dctext').text('dc:'+d.data.length);//.attr('y', (+dataValue));
            //g.select('.legend').text(d.id + ' : ' + str);
            g.select('.legend').text(d.id+'('+d.name + ') : ' + dataValue);
            //g.select('.dvtext').text(dataValue).attr('x', mX);//.attr('y', mY);
            //g.select('.circle').text(dataValue);
          });
          //move plot line to stick to nearest time where any value found , then update time and value legends
          ///timeLegend.text(xMoment.format('DD MMM'));
          timeLegend.text(xMoment.format('MM/DD/YYYY,h:mm:ss a'));//add time!
          //update move line time.
          timeLegendML.text(xMoment.format('h:mm:ss a'))
            .attr('x', 35+moveX);

          dataCountText.text(dataCount);
          //var moveX = _xScale(xMoment);
          hoverLine.attr('x1', moveX).attr('x2', moveX);
        }else{
          console.log('nearestDateVal is null!');
          //console.log(mX,dt);
        }
      }
    }
    _svgContainer // mouse event not working on _chartCanvas
      .on('mouseover', function() {
        var mouse = d3.mouse(this);
        var mX = mouse[0] - margin.left,
          mY = mouse[1] - margin.top;
        if (mX > 0 && mY > 0 && mX < width)
          hoverLine.style('opacity', 1);
        else
          hoverLine.style("opacity", 1e-6);
      })
      .on('mouseout', function() {
        hoverLine.style("opacity", 1e-6);
      })
      .on('mousemove', updateHLValue);

    //try to response keyboard events here:
    d3.select("body")
    .on("keydown", function() {
      //console.log("keyCode: " + d3.event.keyCode);
      var kc = d3.event.keyCode;
      switch(kc){
        case 37:
          console.log('move to left');
          break;
        case 39:
          console.log('move to right');
          break;
      }
    });
  };

  //select and generate a chart plugin to render
  function selectChart(d) {
    if(!d.visible) return null;
    var chart = d3.analog().height(logChartHeight).gap(gap).color(color);
    if (chart) {
      //config common features
      chart.timeScale(_xScale).x(function(t) {
        return moment(t.DateTime).toDate();
      });
    }
    return chart;
  }

  //generate a chart plugin to render
  function drawChart(d,g) {
    if(!d.visible) return;
    var chart = d3.analog().height(logChartHeight).gap(gap).color(color);
    if (chart) {
      //config common features
      chart.timeScale(_xScale).x(function(t) {
        return moment(t.DateTime).toDate();
      });
      g.call(chart);
    }
  }

  function graphHeight(d) {
    return d.visible?logChartHeight:0;
    //return logChartHeight;
  }

  function adjustChartHeight() {
    height = 0;
    _.each(_graphs, function(t) {
      height += graphHeight(t);
    });
    containerHeight = height + margin.top + margin.bottom;
    _svgContainer.attr('height', containerHeight);
    $('.loader').height(containerHeight);
    _svgContainer.select('#clip').select('rect').attr('height', height);
    //_chartCanvas.select('.hover-line').attr('y2', height + 20);
    _chartCanvas.select('.hover-line').attr('y2', height);
  }

  //returns a date from dates array which is nearest from dt
  function minDistanceDate(dates, dt) {
    var result = null,
      distance = Infinity,
      dtVal = moment(dt).valueOf();
    _.each(dates, function(d) {
      var m = moment(d).valueOf();
      if (distance > Math.abs(m - dtVal)) {
        distance = Math.abs(m - dtVal);
        result = d;
      }
    });
    return result;
  }


  //long running, should be non-blocking as user zooms
  function zoom(callback) {
    //artificially spawns background task
    setTimeout(function() {
      _.each(_graphs, function(g) {
        g.map = getLookupMap(g, _xScale);
      });
      callback();
    }, 30);
  }

  //generate hashmap for fast lookup from plotline position
  function getLookupMap(graph, xScale) {

    //hashmap for fast lookup with mousemove (plotline)
    var map = [];
    /*
    var startIndex = _.sortedIndex(graph.data, xScale.domain()[0], function(v) {
      return moment(v).valueOf();
    });
    var endIndex = _.sortedIndex(graph.data, xScale.domain()[1], function(v) {
      return moment(v).valueOf();
    });//*/
    /*
    console.log('graph.data=\n',JSON.stringify(graph.data,null,2));
    var startIndex = _.sortedIndex(graph.data, xScale.domain()[0].toISOString());
    var endIndex = _.sortedIndex(graph.data, xScale.domain()[1].toISOString());//*/

    //console.log('xScale.domain()[0]='+xScale.domain()[0],'xScale.domain()[1]='+xScale.domain()[1]);
    //console.log('xScale[0]='+xScale.domain()[0].toISOString(),'xScale[1]='+xScale.domain()[1].toISOString());
    //console.log('startIndex='+startIndex,'endIndex='+endIndex);
    //var data = _.chain(graph.data).rest(startIndex).initial(endIndex - startIndex).value();
    var data = _.chain(graph.data).value();
    //var data = _.chain(graph.data).rest(startIndex).initial(endIndex).value();
    //console.log('data.length',data.length);

    var dates = _.map(data, function(d) {
      return moment(d.DateTime).valueOf();
    });
    var cursorIndex = 0; // for skipping records on subsequent search

    _.each(d3.range(width), function(px) {
    //_.each(d3.range([0, width]), function(px) {
      var dt = xScale.invert(px);
      var dataIndex = cursorIndex + _.sortedIndex(_.rest(dates, cursorIndex), dt.valueOf()); // assuming data is sorted
      if (dataIndex < data.length) {
        if (dataIndex > 0) {
          var left = moment(data[dataIndex - 1].DateTime),
            right = moment(data[dataIndex].DateTime);
          if (moment(dt).diff(left) < right.diff(dt)) // if left is nearer
            dataIndex = dataIndex - 1;
        }
        map.push({
          date: data[dataIndex].DateTime,
          idx: dataIndex
        });
        //map[px] = data[dataIndex].DateTime;
      }else{
        //console.log(dataIndex,data.length,dt);
      }
      cursorIndex = dataIndex;
    });

    return map;
  }

  //public methods for clients of this module
  this.addGraph = function(graph) {
    //adjust x-axis domain
    var dates = _.map(graph.data, function(d) {
      return moment(d.DateTime).valueOf();
    });
    //console.log('dates.length='+dates.length,'graph.data.length='+graph.data.length);
    var min = dates[0],
      max = dates[dates.length - 1],
      streched = false; // assuming data is sorted
    if (min < _xDomain[0]) {
      _xDomain[0] = min;
      streched = true;
    }
    if (max > _xDomain[1]) {
      _xDomain[1] = max;
      streched = true;
    }
    //console.log('streched',streched);
    //console.log('before',JSON.stringify(_xDomain,null,2));
    if (streched) {
      _xScale.domain(_xDomain);
      //console.log('after',JSON.stringify(_xDomain,null,2));

      //hashmap for fast lookup with plotline
      //calculate all graphs hashmaps as x-scale changed for new graph data
      /*
      _.each(_graphs, function(g) {
        g.map = getLookupMap(g, _xScale);
      });//*/
    }
    //console.log('_xScale.domain()[0],[1]',_xScale.domain()[0],_xScale.domain()[1]);

    //setup graph data
    graph.order = _graphs.length;

    graph.map = getLookupMap(graph, _xScale);
    _graphs.push(graph);

    //disable zoom feature now.
    //zoom scale, this needs to be rendered here as brush event triggers render which cannot change the brush itself
    //var zoomScale = d3.time.scale().range([0, width]).domain(_xScale.domain());
    //var zoomScale = d3.scaleTime().range([0, width]).domain(_xScale.domain());
    var zoomScale = d3.scaleTime().range([0, width]).domain(_xDomain);
    //var zoomScale = d3.scaleTime().range([0, width]);//.domain(_xScale.domain());
    //console.log(JSON.stringify(zoomScale.range(),null,2));
    //console.log(width,zoomScale.range()[1]);
    //var brush = d3.svg.brush()
    var brush = d3.brushX()
      .extent([[50, -8], [width, 8]])
      .on('brush end', function() {
        var selection = d3.event.selection;
        var zoomDomain = _xDomain;
        if(selection != null){
          zoomDomain = selection.map(zoomScale.invert, zoomScale);
          console.log(zoomDomain);
        }
        //console.log(selection[0]);
        //_xScale.domain(selection != null?selection.map(zoomScale.invert, zoomScale):_xDomain);
        _xScale.domain(zoomDomain);
        //generate lookup maps for graphs
        $('.loader').show();
        zoom(function() {
          render();
          $('.loader').hide();
        });
      });

    d3.select('#xAxis')
      .call(brush)
      .selectAll('rect')
      .attr('y', -10)
      .attr('height', 20);//*/

    adjustChartHeight();

    if (graph.render)
      render();
  };

  this.removeGraph = function(graphId) {
    _graphs = _.reject(_graphs, function(g) {
      return g.id === graphId;
    });
    _.chain(_graphs).sortBy(function(g) {
      return g.order;
    }).each(function(g, i) {
      g.order = i;
    });

    adjustChartHeight();

    render();
  };

  //add a new method to hide the chart.
  this.setChartVisible = function(graphId,visible) {
    //find graph in _graphs by graphId,modify it's visible = false;
    var g = _.findWhere(_graphs, {
      id: graphId
    });
    g.visible = visible;
    //maybe need adjust order here,reference removeGraph
    adjustChartHeight();
    render();
  };

  //*
  this.reorderGraph = function(graphId, updown) {
    var g = _.findWhere(_graphs, {
      id: graphId
    });
    if (updown == 'up') {
      var prv = _.findWhere(_graphs, {
        order: g.order - 1
      });
      g.order = g.order > 0 ? (g.order - 1) : 0;
      if (prv)
        prv.order++;
    }
    else if (updown === 'down') {
      var next = _.findWhere(_graphs, {
        order: g.order + 1
      });
      g.order++;
      if (next)
        next.order--;
    }

    render();
  }; //*/

  function removeHiddenCharts(){
    /*/find data first
    var hiddenCharts = _.filter(_graphs, function(g){
      return g.visible == false;
    });//*/

    var hiddenCids = [];
    _.chain(_graphs).filter(function(g){
        return g.visible == false;
      }).each(function(d) {
        hiddenCids.push(d.id);
      });

    if(hiddenCids.length > 0){
      //var hiddenCids = _.pluck(hiddenCharts, 'id');
      //then find graphs
      var hiddenGraphs = _chartCanvas.selectAll('.graph')
        .filter(function(d, i) { return hiddenCids.includes(d.id); });
      //remove them!
      hiddenGraphs.remove();
    }
  }

  //rendering with d3
  this.render = function() {
    removeHiddenCharts();
    //data-bind
    var graphs = _chartCanvas.selectAll('.graph')
      .data(_graphs, function(d) {
        return d.id;
      });
    //x-axis
    //var xAxis = d3.svg.axis().scale(_xScale).orient("top").ticks(5);
    var xAxis = d3.axisTop(_xScale).ticks(5);//.orient("top").ticks(5);
    d3.select('.x.axis').call(xAxis);//*/

    //draw anther x axis on the Bottom.
    //var xScaleBottom = d3.scaleTime().range([0, width]);
    /*
    var xAxisBottom = d3.axisBottom(_xScale).ticks(5);//.orient("top").ticks(5);
    //d3.select('.x.axis').attr("class", "axis axis--x").attr("transform", "translate(0," + height + ")").call(xAxisBottom);
    _chartCanvas.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisBottom);//*/
    //d3.selectAll("path.domain")[0][1].style.stroke = "yellow";

    //remove graph ??
    graphs.exit().remove();

    //update existing graphs
    graphs.each(function(d) {
      //console.log('in graphs.each',d.visible,d.id);
      var g = d3.select(this);
      //position graph
      var tx = 0;
      _.chain(_graphs).filter(function(t) {
        return t.order < d.order;
      }).each(function(t) {
        tx += graphHeight(t);
      });

      //500 is Animated delay.
      g.transition().duration(500).attr('transform', function(d) {
        return 'translate(0, ' + tx + ')';
      });
      drawChart(d,g);
    });//*/

    //add new graphs
    var newGraphs = graphs
      .enter()
      //.append('g')
      .insert('g', '.hover-line') //make hover-line on top
      .attr('class', 'graph')
      .attr('transform', function(d) {
        var tx = 0;
        _.chain(_graphs).filter(function(t) {
          return t.order < d.order;
        }).each(function(t) {
          tx += graphHeight(t);
        });
        return 'translate(0, ' + tx + ')';
      });

    newGraphs.each(function(d) {
      var g = d3.select(this);
      drawChart(d,g);
    });
  };

  this.removeAllCharts = function(){
    _graphs.length = 0;
    _xDomain = [Infinity, -Infinity];//Cool!
    d3.select(_container).selectAll("*").remove();
  };

  return this;
});
