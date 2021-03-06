function makeD3() {
  // clear old graph
  d3.select("svg").remove();
  // Will become size of canvas element; -20 takes off scroll bars
  var width = window.innerWidth - 20;
  var height = window.innerHeight - 20;

  // Make nodes with random sizes, name the first one root
  var nodes = d3.range(100).map(function() { return {radius: Math.random() * 5 + 4}; }),
      root = nodes[0]; // this is the node they all run from

  // Make root invisible
  root.radius = 0;
  root.fixed = true;

  // Make a layout on a canvas of all the nodes, with gravity and charge.
  var force = d3.layout.force()
      .gravity(0.025)
      // if i===True, i = 0, else i = -2000
      .charge(function(d, i) { return i ? 0 : -20000; })
      .nodes(nodes)
      .size([width, height]);

  // Start the animation
  force.start();

  // Add an svg element to the body
  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  // Make a circle for every node, give it a radius and color
  svg.selectAll("circle")
      .data(nodes.slice(1))
    .enter().append("circle")
      .attr("r", function(d) { return d.radius; })
      // .style("fill", "rgb(90,90,90)")
      ;

  // Move nodes 
  force.on("tick", function(e) {

    // Handles circle locations
    var q = d3.geom.quadtree(nodes),
        i = 0,
        n = nodes.length;
    while (++i < n) q.visit(collide(nodes[i]));
      // Holds circles inside the bounds of window height and width
      svg.selectAll("circle")
        .attr("cx", function(d) { return d.x = Math.max(d.radius, Math.min(width - d.radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(d.radius, Math.min(height - d.radius, d.y)); })

  });

  // Anchor root to mouse
  svg.on("mousemove", function() {
    // identify mouse location
    var p1 = d3.mouse(this);
    // move the invisible root node to the mouse position
    root.px = p1[0];
    root.py = p1[1];
    force.resume();
  });

  // Control collisions
  function collide(node) {
    var r = node.radius + 25,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== node)) {
        var x = node.x - quad.point.x,
            y = node.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = node.radius + quad.point.radius;
        if (l < r) {
          l = (l - r) / l * .5;
          node.x -= x *= l;
          node.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
  }
};

// Make initial graph
makeD3();

// reload graph on resize
$(window).resize(makeD3);