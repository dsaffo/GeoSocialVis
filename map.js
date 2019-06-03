const AtlasMap = (function(projection) {
    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const path = d3.geoPath().projection(projection);

    d3.json('data/world-countries.json', function(error, worldMapData) {
        svg.select('.map')
            .selectAll('path')
            .data(worldMapData.features)
            .enter().append('path')
            .attr('d', path);
    });
});