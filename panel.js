const Panel = (function (dispatch) {
  // const element = document.getElementsByClassName('panel')[0];


  var listOptions = {
    valueNames: ['Title', 'Year', 'AuthorNames-Deduped'],
    item: '<li><h3 class="Title"></h3><p class="Year"><p><p class="AuthorNames-Deduped"></p></li>'
  };

  var paperList = new List('papers', listOptions, []);

  let papers = []

  dispatch.on('authorHighlighted.panel', function (author, selections) {

    if (selections.clickedNodes.length == 0) {


      for (i = 0; i < author.paperIndex.length; i++) {
        papers.push(allPapers[author.paperIndex[i]]);
      }

      paperList.add(papers.reverse());
    }

  });

  dispatch.on('authorUnhighlighted.panel', function (selections) {
    if (selections.clickedNodes.length == 0) {
      papers = []
      paperList.clear();
    }
  });

  dispatch.on('authorClicked.panel', function (author, selections) {

    if (selections.searchResults.length == 0) {
      for (i = 0; i < author.paperIndex.length; i++) {
        if (papers.indexOf(allPapers[author.paperIndex[i]]) < 0) {
          papers.push(allPapers[author.paperIndex[i]]);
        }
      }

      paperList.clear();
      paperList.add(papers);
    }
  })

  dispatch.on('authorUnClicked.panel', function (selections) {
    papers = []
    paperList.clear();
  })
  
  dispatch.on('search.panel', function (selections) {
    if (selections.search == ''){
      papers = []
      paperList.clear();
    }else{
      paperList.clear();
      paperList.add(selections.searchResults);
    }
  })

});
