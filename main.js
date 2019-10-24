(function(){
    const svg = d3.select("svg");
    
  //  let w = window.innerWidth * 0.8;
    // let h = window.innerHeight;
    
    //svg.attr("width", w).attr("height",h);
    
    const  width = +svg.attr("width"),
        height = +svg.attr("height");

    const projection = d3.geoMercator()
        .scale(250)
        .translate( [width / 2 - 50, height / 1.5]);

    const dispatch = d3.dispatch("authorHighlighted", "authorUnhighlighted", "paperHighlighted", "authorClicked", "authorUnClicked", "search");

    const networkVis = NetworkVis(dispatch, projection);
    const panel = Panel(dispatch);
    const map = AtlasMap(projection);
  
    $(function() {
    var $target = $('#papers');
    $(".nodes").mousewheel(function(event, delta) {
      $target.scrollTop($target.scrollTop() - (delta * 30));
   });
});
})();