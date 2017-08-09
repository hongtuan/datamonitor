(function() {
  d3.analog = function() {
    var height = 100,
      gap = 10,
      xValue = function(d) {
        return d[0];
      },
      xScale = null,
      yScale = null,
      //xScale = d3.time.scale().range([0, width]),
      //yScale = null;//d3.scale.linear().range([height, 0]),
      //color = d3.scale.category10();
      color = d3.scaleOrdinal(d3.schemeCategory10);

    function chart(selection) {
      selection.each(function(d) {
        //console.log(d.visible,d.lid);
        var g = d3.select(this);
        function drawDots(){
          //_.each(d.yVal, function(c, i) {
          g.selectAll('.circle').data(d.data).enter().append("circle")
            .style('stroke', color(d.order))
            .style('fill', color(d.order))
            .attr("cx", function(d) {return xScale(moment(d.DateTime).valueOf());})
            .attr("cy", function(d) {return yScale(d.Value); })
            .attr("r", function(d) {return 2; });
          //});
        }
        
        function drawDataCountBar(){
          //calc the dataCount
          var dc = 0;//,sumv = 0;
          _.chain(d.data).filter(function(di){
              return di.isSham == undefined;
            }).each(function(d) {
              dc += 1;
              //sumv += d.Value;
            });
          //console.log('analog:',dc,d.order);
          if(dc > 0) {
            //calc AverageValue
            //var avgv = Math.floor(sumv/dc);
            //create a g object for rect.
            var dcg = g.append("g").attr("class","dcrect").attr("x", 0);
            
            var xRectWidthScale = d3.scaleLinear()
              .domain([0, Math.max(400,dc*1.1)])
              //.domain([0, 10000])
              .range([0, 400]);
  
            var rectWidth = xRectWidthScale(dc);
            //draw a rect for dataCount.
            var dcRect = dcg.append("rect")
              .attr("y", 60)
              .attr("width",rectWidth)
              .attr("height", 10)
              .style("fill", color(d.order));
            //add a label to show dataCount
            dcg.append("text")
              .attr("x", rectWidth-1)
              .attr("text-anchor","end")
              .attr("y",70)
              .style("fill", "white")
              .text(dc);
              //.text(`${dc}datas,avg:${avgv}`);
            //add a link when has lid
            if(d.lid) {
              //need get the min and max time here:
              //console.log('rang:',d.map[0].date,d.map[d.map.length - 1].date);
              var from = d.map[0].date;
              var to = d.map[d.map.length - 1].date;
              //var link = `<a href='/dm/vnd/${d.lid}/${d.pid}?from=${from}&to=${to}'>${dc}</a>`;
              var link = `/dm/vnd/${d.lid}/${d.pid}?from=${from}&to=${to}`;
              //append a rect for click
              var clkrect = g.append("g")
                .attr("class","clkrect")
                .attr("x", 0)
                .append("rect")
                .attr("title","xxxx")
                .attr("y",0)
                .attr("width",500)
                .attr("height", 70);
              //dcRect.on('click',function(){
              clkrect.on('click',function(){
                //console.log('dcg click.');
                window.location = link;
              });
            }
          }
        }
        
        
        //add on 6/5/2017 by Tim
        function drawAverageValue(){
          //calc the dataCount
          //console.log(JSON.stringify(d));
          var dc = 0,sumv = 0;
          var minX = '',maxX = '';
          if(d.data.length>=2){
            minX = d.data[1].DateTime;
            maxX = d.data[d.data.length-2].DateTime;
          }
          
          _.chain(d.data).filter(function(di){
              //console.log(JSON.stringify(di));
              return di.isSham == undefined;
            }).each(function(d) {
              dc += 1;
              //console.log(JSON.stringify(d));
              sumv += d.Value;
            });
          var avgV = dc>0?sumv/dc:0;
          avgV = avgV.toFixed(2);
          //console.log(dc,sumv,avgV);
          if(avgV>0 && maxX != ''){
            var avglh = yScale(avgV);
            var avgls = xScale(moment(minX).valueOf());
            var avglw = xScale(moment(maxX).valueOf());
            var line = g.append("line")
              .attr("x1",avgls)
              .attr("y1",avglh)
              .attr("x2",avglw)
              .attr("y2",avglh)
              .attr("stroke",color(d.order))
              .attr("stroke-width",1);
            
            var tips = g.append('g').attr('class', 'tips');
            tips.append('rect')
              .attr('class', 'tips-border')
              .attr("stroke",color(d.order))
              .attr('width', 120)
              .attr('height', 30)
              .attr('rx', 10)
              .attr('ry', 10);
            var wording1 = tips.append('text')
              .attr('class', 'tips-text')
              .attr('x', 10)
              .attr('y', 20)
              .attr("stroke",color(d.order))
              .text('avg:'+avgV);
            //wording1.text();
            //d3.select('.tips')
            tips.attr('transform', 'translate(' + 10 + ',' + Math.floor(avglh) + ')');
          }          
        }

        var chartConfig = this.__chart__;

        if (chartConfig) {
          var yDomain = chartConfig.yDomain;
          //var y = chartConfig.y;
          var yScale = chartConfig.yScale;
        }
        else {
          var minY = _.min(d.data, function(v) {
            return _.chain(d.yVal).map(function(c) {
              return v[c];
            }).min().value();
          });
          var maxY = _.max(d.data, function(v) {
            return _.chain(d.yVal).map(function(c) {
              return v[c];
            }).max().value();
          });
          minY = _.chain(d.yVal).map(function(c) {
            return minY[c];
          }).min().value();
          maxY = _.chain(d.yVal).map(function(c) {
            return maxY[c];
          }).max().value();
          //fix the equals valus bug!
          if (minY == maxY) {
            minY = 0;
            maxY *= 1.1;
          }
          yDomain = [minY, maxY];

          //y = d3.scale.linear().domain(yDomain).range([height - gap, 0]);
          //yScale = d3.scale.linear().domain(yDomain).range([height - gap, 0]);
          yScale = d3.scaleLinear().domain(yDomain).range([height - gap, 0]);
          //*
          //var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
          //var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
          var yAxis = d3.axisLeft(yScale).ticks(5);
          g.attr('id', d.id) // add y axis
            .append('g')
            .attr("class", "y axis")
            .attr('transform', 'translate(-1, 0)') // avoid making the vertical line disappear by clip when zoomed with brush
            .call(yAxis);//*/
        }

        //add path for each y-Value dimension 
        _.each(d.yVal, function(c, i) {
          //setup line function
          //var valueline = d3.svg.line()
          var valueline = d3.line()
            //.interpolate('basis')
            //.x(function (a) { return xScale(moment(a.DateTime).toDate()); })
            .x(X)
            .y(function(a) {
              //return y(a[c]);
              return yScale(a[c]);
            });
          //*
          if (chartConfig) {
            //g.select(".path." + c).transition().duration(1000) //update path
            g.select(".path." + c).transition()
              .attr("d", valueline(d.data));
            //update dot.
            //clear dots first.
            g.selectAll('circle').remove();
            //then redraw dots.
            drawDots();
            g.select(".dcrect").remove();
            drawDataCountBar();
            if(d.showAvg)
              drawAverageValue();
          }
          else {
            //*
            g.append("path") //add path 
              .attr('class', 'path ' + c)
              .attr("d", valueline(d.data))
              .attr("clip-path", "url(#clip)")
              //.style('stroke', color(d.id + i));//*/
              .style('stroke', color(d.order));//*/
            
            //add dot for each data.
            drawDots();
            drawDataCountBar();
            if(d.showAvg)
              drawAverageValue();

            //add legend
            g.append('text').text(d.name)
              .attr('class', 'legend')
              //.attr('x', 10).attr('y', 10);
              .attr('x', 5).attr('y', -5);
            //add value text
            g.append('text').text('')
              .attr('class', 'dvtext')
              .attr('x', 10).attr('y', 25);
          }
        });

        //stash chart settings for update
        this.__chart__ = {
          yDomain: yDomain,
          //y: y
          yScale: yScale
        };
      });
    }
    // The x-accessor for the path generator; xScale 
    function X(d) {
      return xScale(xValue(d));
    }

    chart.timeScale = function(_) {
      if (!arguments.length) return xScale;
      xScale = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return xValue;
      xValue = _;
      return chart;
    };

    chart.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };
    chart.gap = function(_) {
      if (!arguments.length) return gap;
      gap = _;
      return chart;
    };

    chart.color = function(_) {
      if (!arguments.length) return color;
      color = _;
      return chart;
    };

    return chart;
  };
})();
