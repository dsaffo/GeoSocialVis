const NetworkVis = (function (dispatch, projection) {
  const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  const forceBalance = ForceBalance(projection);
  const simulation = forceBalance.simulation;

  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  let highlightedAuthor = null;
  let selectedNodes = [];
  let selectedEdges = [];

  dispatch.on('authorUnhighlighted.networkVis', function () {
    div.transition()
      .duration(100)
      .style("opacity", 0);

    highlightedAuthor = null;
    selectedNodes = [];
    selectedEdges = [];
    redraw();
  });

  dispatch.on('authorHighlighted.networkVis', function (d) {

    div.transition()
      .duration(100)
      .style("opacity", 1);
    div.html(d.id + "</br>" + d.affiliation)
      .style("left", (d3.event.pageX + 20) + "px")
      .style("top", (d3.event.pageY - 88) + "px");

    var names = [];

    highlightedAuthor = d;
    selectedNodes.push(d);

    for (i = 0; i < graph.links.length; i++) {
      if (graph.links[i].source.id == d.id) {
        selectedEdges.push(graph.links[i])
        names.push(graph.links[i].target.id)
      }
      if (graph.links[i].target.id == d.id) {
        selectedEdges.push(graph.links[i])
        names.push(graph.links[i].source.id)
      }
    }

    for (i = 0; i < graph.nodes.length; i++) {
      if (names.indexOf(graph.nodes[i].id) >= 0) {
        selectedNodes.push(graph.nodes[i])
      }
    }

    //console.log(selectedNodes)
    //console.log(selectedEdges)

    redraw();
  });

  const path = d3.geoPath().projection(projection);

  const affiliationsWithLocation = affiliations
    .filter(a => a.Position);
  for (const affiliation of affiliationsWithLocation) {
    const splitPos = affiliation.Position.split(',');
    affiliation.lat = parseFloat(splitPos[0]);
    affiliation.lng = parseFloat(splitPos[1]);
  }
  const affiliationsByName = {};
  for (const affiliation of affiliations) {
    affiliationsByName[affiliation.Name] = affiliation;
  }

  svg.append('g')
    .attr('class', 'affiliations')
    .selectAll('circle')
    .data(affiliationsWithLocation)
    .enter().append('circle');

  const color = d3.scaleOrdinal(d3.schemeCategory20);

  for (const node of graph.nodes) {
    const match = affiliationsWithLocation.filter(a => a.Name === node.affiliation);
    if (match && match.length > 0) {
      node.lat = match[0].lat;
      node.lng = match[0].lng;
      node.x = projection([node.lng, node.lat])[0];
      node.y = projection([node.lng, node.lat])[1];
    }
  }

  graph.nodes.sort((a, b) => a.paperIndex.length - b.paperIndex.length);

  const link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function (d) {
      return Math.sqrt(d.value);
    })
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.2);

  const nodesG = svg.append("g")
    .attr("class", "nodes");

  const node = nodesG
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("r", d => Math.sqrt(20 * d.paperIndex.length))
    .attr("fill", function (d) {
      const affiliation = affiliationsByName[d.affiliation];
      if (!affiliation) {
        return '#aaa';
      }
      const name = affiliation.NameSimple ? affiliation.NameSimple : d.affiliation;
      return color(name);
    })
    .on('mouseover', function (d) {
      dispatch.call('authorHighlighted', this, d);
    })
    .on('mouseout', function (d) {
      dispatch.call('authorUnhighlighted', this);
    })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  graph.nodes.forEach(d => {
    if (d.paperIndex.length >= 8) {
      d.textEl = svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .attr('font-size', 16)
        .attr('pointer-events', 'none')
        .text(() => {
          const nameParts = d.id.split(' ');
          const initials = nameParts[0][0] + nameParts[nameParts.length - 1][0];
          return d.paperIndex.length >= 8 ? initials : '';
        });
    }
  });

  simulation
    .nodes(graph.nodes)
    .on("tick", redraw);
  simulation.force("link")
    .links(graph.links);

  function redraw() {

    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    link
      .attr('stroke', d => {
        if (selectedEdges == 0) {
          return '#999'
        } else if (selectedEdges.indexOf(d) >= 0) {
          return '#4f4544'
        } else {
          return '#999'
        }
      })
      .attr('stroke-opacity', d => {
        if (selectedEdges == 0) {
          return 0.2
        } else if (selectedEdges.indexOf(d) >= 0) {
          return 0.6
        } else {
          return 0.0
        }
      });

    nodesG.selectAll('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .transition().duration(100)
      .attr('stroke', d => {
        if (!highlightedAuthor) return '#fff';

        if (d.id === highlightedAuthor.id) {
          return 'red';
        }
        return '#ccc';
      })
      .attr('opacity', d => {
        if (selectedNodes.length == 0) {
          return 1;
        } else if (selectedNodes.indexOf(d) >= 0) {
          return 1;
        } else {
          return 0.1;
        }
      });

    graph.nodes.forEach(d => {
      if (d.textEl) {
        d.textEl
          .attr('x', d.x)
          .attr('y', d.y)
          .attr('opacity', function () {
            if (selectedNodes.length == 0) {
              return 1;
            } else if (selectedNodes.indexOf(d) >= 0) {
              return 1;
            } else {
              return 0.1;
            }
          });
      }
    });
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
});
