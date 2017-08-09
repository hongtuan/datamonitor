!function(){
  var mapBoard = {};
  
  function getProjection(pc){
    //build the projection here.
    //console.log(JSON.stringify(pc,null,2));
    var projection = d3.geo.mercator();
    projection.scale(pc.scale)
      .translate([pc.width,pc.height])
      .center(pc.center);
    return projection;
  }

  mapBoard.draw = function(id,w,h, data, pc){
    //clear first.
    var _container = "#"+id;
    d3.select(_container).selectAll("*").remove();

    var svg = d3.select(_container).append("svg")
      .attr("width", w).attr("height", h)
      .style("border", "1px solid white");
    var nodeG = svg.append("g");
    
    var projection = getProjection(pc);
    var nodesInfo = [];
    var pidNodeMap = data.nsiMap;
    for(var pid in pidNodeMap){
      var node = pidNodeMap[pid];
      nodesInfo.push({
        ptag:node.ptag,
        pos:node.pos,
      });
    }
    var node = nodeG.selectAll("circle")
      .data(nodesInfo)
      .enter().append("circle")
      .attr("cx", function(d) {
        var tmpA = d.pos.split(',');
        return projection([tmpA[1], tmpA[0]])[0];
      })
      .attr("cy", function(d) {
        var tmpA = d.pos.split(',');
        return projection([tmpA[1], tmpA[0]])[1];
      })
      .attr("r", "10")
      .attr("fill", "red");
    
    var tagG = svg.append("g");
    var tag = tagG.selectAll("text")
      .data(data)
      .enter().append("text")
      .attr("x", function(d) {
        var tmpA = d.pos.split(',');
        return projection([tmpA[1], tmpA[0]])[0];
      })
      .attr("y", function(d) {
        var tmpA = d.pos.split(',');
        return projection([tmpA[1], tmpA[0]])[1];
      })
      .text(function(d) { return d.ptag; })
      .attr("fill", "white");
  }
  this.mapBoard = mapBoard;
}();
