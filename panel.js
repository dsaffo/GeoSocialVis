const Panel = (function (dispatch) {
  // const element = document.getElementsByClassName('panel')[0];


  var listOptions = {
    valueNames: ['Title', 'Year', 'AuthorNames-Deduped'],
    item: '<li><h3 class="Title"></h3><p class="Year"><p><p class="AuthorNames-Deduped"></p></li>'
  };

  var paperList = new List('papers', listOptions, []);

  dispatch.on('authorHighlighted.panel', function (author) {
    
    var papers = [];
    
    for (i = 0; i < author.paperIndex.length; i++){
      papers.push(allPapers[author.paperIndex[i]]);
    }
    
    paperList.add(papers.reverse());
    
  });
  
  dispatch.on('authorUnhighlighted.panel', function () {
    paperList.clear();
  });
});
