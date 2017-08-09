function dashboard(id, fData, option) {
  var _option = {
    hGDimW: 300,
    hGDiH: 300,
    pieDim: {
      w: 250,
      h: 250
    }
  };
  if (option) {
    if (option.hGDimW != undefined) _option.hGDimW = option.hGDimW;
    if (option.hGDiH != undefined) _option.hGDiH = option.hGDiH;
    if (option.pieDim != undefined) _option.pieDim = option.pieDim;
  }
  var barColor = 'steelblue';
  //function segColor(c){ return {low:"#807dba", mid:"#e08214",high:"#41ab5d"}[c]; }
  function segColor(c) {
    return {
      low: "blue",
      mid: "green",
      high: "red"
    }[c];
  }

  // compute total for each name.
  fData.forEach(function(d) {
    d.total = d.freq.low + d.freq.mid + d.freq.high;
  });

  // function to handle histogram.
  function histoGram(fD) {
    var hG = {},
      hGDim = {
        t: 50,
        r: 0,
        b: 30,
        l: 0
      };
    hGDim.w = _option.hGDimW - hGDim.l - hGDim.r,
      hGDim.h = _option.hGDiH - hGDim.t - hGDim.b;

    //create svg for histogram.
    var hGsvg = d3.select(id).append("svg")
      .attr("width", hGDim.w + hGDim.l + hGDim.r)
      .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
      .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

    // create function for x-axis mapping.
    var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
      .domain(fD.map(function(d) {
        return d[0];
      }));

    // Add x-axis to the histogram svg.
    hGsvg.append("g").attr("class", "x axis")
      .attr("transform", "translate(0," + hGDim.h + ")")
      .call(d3.svg.axis().scale(x).orient("bottom"));

    // Create function for y-axis map.
    var y = d3.scale.linear().range([hGDim.h, 0])
      .domain([0, d3.max(fD, function(d) {
        return d[1];
      })]);

    // Create bars for histogram to contain rectangles and freq labels.
    var bars = hGsvg.selectAll(".bar").data(fD).enter()
      .append("g").attr("class", "bar");

    //create the rectangles.
    bars.append("rect")
      .attr("x", function(d) {
        return x(d[0]);
      })
      .attr("y", function(d) {
        return y(d[1]);
      })
      .attr("width", x.rangeBand())
      .attr("height", function(d) {
        return hGDim.h - y(d[1]);
      })
      .attr('fill', barColor)
      .on("mouseover", mouseover) // mouseover is defined below.
      .on("mouseout", mouseout); // mouseout is defined below.

    //Create the frequency labels above the rectangles.
    bars.append("text").text(function(d) {
        return d3.format(",")(d[1])
      })
      .attr("x", function(d) {
        return x(d[0]) + x.rangeBand() / 2;
      })
      .attr("y", function(d) {
        return y(d[1]) - 5;
      })
      .attr("text-anchor", "middle");

    function mouseover(d) { // utility function to be called on mouseover.
      // filter for selected name.
      var st = fData.filter(function(s) {
          return s.name == d[0];
        })[0],
        nD = d3.keys(st.freq).map(function(s) {
          return {
            type: s,
            freq: st.freq[s],
            desc: st.desc,
            freqDetail:st.freqDetail[s]
          };
        });

      // call update functions of pie-chart and legend.    
      pC.update(nD);
      leg.update(nD);
    }

    function mouseout(d) { // utility function to be called on mouseout.
      // reset the pie-chart and legend.    
      pC.update(tF);
      leg.update(tF,'All Data');
      //leg.update(tF);
    }

    // create function to update the bars. This will be used by pie-chart.
    hG.update = function(nD, color) {
      // update the domain of the y-axis map to reflect change in frequencies.
      y.domain([0, d3.max(nD, function(d) {
        return d[1];
      })]);

      // Attach the new data to the bars.
      var bars = hGsvg.selectAll(".bar").data(nD);

      // transition the height and color of rectangles.
      bars.select("rect").transition().duration(_option.hGDimW)
        .attr("y", function(d) {
          return y(d[1]);
        })
        .attr("height", function(d) {
          return hGDim.h - y(d[1]);
        })
        .attr("fill", color);

      // transition the frequency labels location and change value.
      bars.select("text").transition().duration(_option.hGDimW)
        .text(function(d) {
          return d3.format(",")(d[1])
        })
        .attr("y", function(d) {
          return y(d[1]) - 5;
        });
    };
    return hG;
  }

  // function to handle pieChart.
  function pieChart(pD) {
    var pC = {},
      pieDim = _option.pieDim;
    pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

    // create svg for pie chart.
    var piesvg = d3.select(id).append("svg")
      .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
      .attr("transform", "translate(" + pieDim.w / 2 + "," + pieDim.h / 2 + ")");

    // create function to draw the arcs of the pie slices.
    var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

    // create a function to compute the pie slice angles.
    var pie = d3.layout.pie().sort(null).value(function(d) {
      return d.freq;
    });

    // Draw the pie slices.
    piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
      .each(function(d) {
        this._current = d;
      })
      .style("fill", function(d) {
        return segColor(d.data.type);
      })
      .on("mouseover", mouseover).on("mouseout", mouseout);

    // create function to update pie-chart. This will be used by histogram.
    pC.update = function(nD) {
      piesvg.selectAll("path").data(pie(nD)).transition().duration(_option.hGDimW)
        .attrTween("d", arcTween);
    };
    // Utility function to be called on mouseover a pie slice.
    function mouseover(d) {
      // call the update function of histogram with new data.
      hG.update(fData.map(function(v) {
        return [v.name, v.freq[d.data.type]];
      }), segColor(d.data.type));
    }
    //Utility function to be called on mouseout a pie slice.
    function mouseout(d) {
      // call the update function of histogram with all data.
      hG.update(fData.map(function(v) {
        return [v.name, v.total,v.desc];
      }), barColor);
    }
    // Animating the pie-slice requiring a custom function which specifies
    // how the intermediate paths should be drawn.
    function arcTween(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    }
    return pC;
  }

  // function to handle legend.
  function legend(lD) {
    var leg = {};
    //create title of data.
    var title = d3.select(id).append("div").attr('class', 'datadesc');
    title.append("text").text('All Data');
    // create table for legend.
    var legend = d3.select(id).append("table").attr('class', 'legend');
    //var legend = d3.select(id).append("div").append("table").attr('class', 'legend');

    // create one row per segment.
    var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");

    // create the first column for each segment.
    tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
      .attr("width", '16').attr("height", '16')
      .attr("fill", function(d) {
        return segColor(d.type);
      });

    // create the second column for each segment.
    tr.append("td").text(function(d) {
      return d.type;
    });

    // create the third column for each segment.
    tr.append("td").attr("class", 'legendFreq')
      .text(function(d) {
        return d3.format(",")(d.freq);
      });

    // create the fourth column for each segment.
    tr.append("td").attr("class", 'legendPerc')
      .text(function(d) {
        return getLegend(d, lD);
      });

    tr.append("td").attr("class", 'freqDetail')
      .text(function(d) {
        return '';
      });

    // Utility function to be used to update the legend.
    leg.update = function(nD) {
      var t = title.select("text").data(nD);
      t.text(function(d) {return d.desc;});
      // update the data attached to the row elements.
      var l = legend.select("tbody").selectAll("tr").data(nD);

      // update the frequencies.
      l.select(".legendFreq").text(function(d) {
        return d3.format(",")(d.freq);
      });

      // update the percentage column.
      l.select(".legendPerc").text(function(d) {
        return getLegend(d, nD);
      });
      //*
      l.select(".freqDetail").text(function(d) {
        var str = '';
        if(d.freqDetail){
          var i = 0;
          d.freqDetail.forEach(function(fd){
            str += fd +','
            if(++i%20 == 0) str += '\n';
          });
        }
        return str!=''?str.substr(0,str.length-1):'';
      });
    };

    function getLegend(d, aD) { // Utility function to compute percentage.
      return d3.format("%")(d.freq / d3.sum(aD.map(function(v) {
        return v.freq;
      })));
    }
    return leg;
  }

  // calculate total frequency by segment for all name.
  //var tF = ['low', 'mid', 'high'].map(function(d) {
  var tF = ['high', 'mid', 'low'].map(function(d) {
    return {
      type: d,
      freq: d3.sum(fData.map(function(t) {
        return t.freq[d];
      }))
    };
  });

  // calculate total frequency by name for all segment.
  var sF = fData.map(function(d) {
    return [d.name, d.total];
  });

  var  pC = pieChart(tF), // create the pie-chart.
    hG = histoGram(sF), // create the histogram.
    leg = legend(tF); // create the legend.
}

