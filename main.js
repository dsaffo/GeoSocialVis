(function(){
    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const projection = d3.geoMercator()
        .scale(250)
        .translate( [width / 2 - 50, height / 1.5]);

    const networkVis = NetworkVis(projection);
})();