const NetworkVis = (function(dispatch, projection) {
    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const forceBalance = ForceBalance(projection);
    const simulation = forceBalance.simulation;

    let highlightedAuthor = null;

    dispatch.on('authorUnhighlighted.networkVis', function() {
        highlightedAuthor = null;
        redraw();
    });
    dispatch.on('authorHighlighted.networkVis', function(author) {
        highlightedAuthor = author;
        redraw();
    });

    const path = d3.geoPath().projection(projection);

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
        .enter().append('circle');

    const color = d3.scaleOrdinal(d3.schemeCategory20);

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

    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    const nodesG = svg.append("g")
        .attr("class", "nodes");

    const node = nodesG
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
        .on('mouseover', function(author) {
            dispatch.call('authorHighlighted', this, author);
        })
        .on('mouseout', function(author) {
            dispatch.call('authorUnhighlighted', this);
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
        .on("tick", redraw);
    simulation.force("link")
        .links(graph.links);

    function redraw() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        nodesG.selectAll('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('stroke', d => {
                if(!highlightedAuthor) return '#ffffff';

                if(d.id === highlightedAuthor.id) {
                    return 'red';
                }
                return '#ccc';
            });

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
});