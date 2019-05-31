(function(){
    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const projection = d3.geoMercator()
        .scale(250)
        .translate( [width / 2 - 50, height / 1.5]);

    const dispatch = d3.dispatch("authorHighlighted", "authorUnhighlighted", "paperHighlighted", "authorClicked", "authorUnClicked", "search");

    const networkVis = NetworkVis(dispatch, projection);
    const panel = Panel(dispatch);
  
  
    $(function() {
    var $target = $('#papers');
    $(".nodes").mousewheel(function(event, delta) {
      $target.scrollTop($target.scrollTop() - (delta * 30));
   });
});
})();