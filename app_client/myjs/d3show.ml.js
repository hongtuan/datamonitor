//console.log('hehe.');
//var parseTime = d3.isoParse;
//console.log('I am here.111');
var svg = d3.select("svg"),
  margin = {top: 20, right: 20, bottom: 30, left: 50},
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom,
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//var parseTime = d3.timeParse("%d-%b-%y");
//var strictIsoParse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
var x = d3.scaleTime().rangeRound([0, width]);

var y = d3.scaleLinear().rangeRound([height, 0]);

var z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.sd); });

//call json.
d3.json('/api/nd/getnd/005043c9e72753a5', function(rawDataList) {
  if (Array.isArray(rawDataList)) {
    var data = [];
    rawDataList.forEach(function(rd) {
      var nvl = rd.data.split(',');
      var d = {
        date: d3.isoParse(rd.dataTime)
      };
      nvl.forEach(function(nv){
        var ta = nv.split(':');
        d[ta[0]] = +ta[1];
      });
      data.push(d);
    });
    console.log(JSON.stringify(data,null,2));
    var nodes  = [];
    data.forEach(function(obj) {
      for(var k in obj){
        //console.log(k,obj[k]);
        if(k=='date') continue;
        nodes .push({
          id:k,
          values:data.map(function(d) {
            return {date: d.date, sd: d[k]};
          })
        });
      }
    });
    x.domain(d3.extent(data, function(d) { return d.date; }));

    y.domain([
      d3.min(nodes, function(c) { return d3.min(c.values, function(d) { return d.sd; }); }),
      d3.max(nodes, function(c) { return d3.max(c.values, function(d) { return d.sd; }); })
    ]);
  
    z.domain(nodes.map(function(c) { return c.id; }));
  
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
  
    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("sensordata");
  
    var city = g.selectAll(".city")
      .data(nodes)
      .enter().append("g")
        .attr("class", "city");
  
    city.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return z(d.id); });
  
    city.append("text")
        .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.sd) + ")"; })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function(d) { return d.id; });
  }
});
