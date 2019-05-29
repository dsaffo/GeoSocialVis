var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var projection = d3.geoMercator()
    .scale(250)
    .translate( [width / 2 - 50, height / 1.5]);

var path = d3.geoPath().projection(projection);

var diameter = 800;
var radius = diameter / 2;
var margin = 20;

function drawRing(graph) {

    var plot = svg.append("g")
        .attr("class", "plot")
        .attr("transform", "translate(" + width/2 + ", " + height/2 + ")");


    // calculate node positions
    ellipseLayout(graph.nodes);

    drawNodes(graph.nodes);
}

// Calculates node locations
function ellipseLayout(nodes) {
    // use to scale node index to theta value
    var scale = d3.scaleLinear()
        .domain([0, nodes.length])
        .range([0, 2 * Math.PI]);

    // calculate theta for each node
    nodes.forEach(function(d, i) {
        // calculate polar coordinates
        var theta  = scale(i);
        var radial = radius - margin;

        // convert to cartesian coordinates
        d.x = (radial + 500) * Math.sin(theta);
        d.y = (radial + 65) * Math.cos(theta);
    });
}

// Draws nodes with tooltips
function drawNodes(nodes) {
    d3.select(".plot").selectAll(".node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("id", function(d, i) { return d.id; })
        .attr("cx", function(d, i) { return d.x; })
        .attr("cy", function(d, i) { return d.y; })
        .attr("r", 2)
        .style("fill",   function(d, i) { return 'red' });
}


const affiliationsWithLocation = affiliations
    .filter(a => a.Position);
for(const affiliation of affiliationsWithLocation) {
    const splitPos = affiliation.Position.split(',');
    affiliation.lat = parseFloat(splitPos[0]);
    affiliation.lng = parseFloat(splitPos[1]);
}
const affiliationsByName = {};
for(const affiliation of affiliations) {
    affiliationsByName[affiliation.Name] = affiliation;
}

svg.append('g')
    .attr('class', 'affiliations')
    .selectAll('circle')
    .data(affiliationsWithLocation)
    .enter().append('circle')
/*.attr('r', 5)
.attr('cx', d => projection([d.lng, d.lat])[0])
.attr('cy', d => projection([d.lng, d.lat])[1])
.style('fill', () => '#a00');*/

var color = d3.scaleOrdinal(d3.schemeCategory20);



for(const node of graph.nodes) {
    const match = affiliationsWithLocation.filter(a => a.Name === node.affiliation);
    if(match && match.length > 0) {
        node.lat = match[0].lat;
        node.lng = match[0].lng;
        node.x = projection([node.lng, node.lat])[0];
        node.y = projection([node.lng, node.lat])[1];
    }
}

graph.nodes.sort((a,b) => a.paperIndex.length - b.paperIndex.length);
//console.log(graph.nodes);

var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

var nodesG = svg.append("g")
    .attr("class", "nodes");

var node = nodesG
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("r", d => Math.sqrt(20 * d.paperIndex.length))
    .attr("fill", function(d) {
        const affiliation = affiliationsByName[d.affiliation];
        if(!affiliation) {
            return '#aaa';
        }
        const name = affiliation.NameSimple ? affiliation.NameSimple : d.affiliation;
        return color(name);
    })
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

graph.nodes.forEach(d => {
    if(d.paperIndex.length >= 8) {
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
    .on("tick", ticked);
simulation.force("link")
    .links(graph.links);

function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    nodesG.selectAll('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

    graph.nodes.forEach(d => {
        if(d.textEl) {
            d.textEl
                .attr('x', d.x)
                .attr('y', d.y);
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