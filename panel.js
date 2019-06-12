const Panel = (function (dispatch) {
  // const element = document.getElementsByClassName('panel')[0];


  var listOptions = {
    valueNames: ['Title', 'Year', 'AuthorNames-Deduped'],
    item: '<li><h3 class="Title"></h3><p class="Year"><p><p class="AuthorNames-Deduped"></p></li>'
  };

  var paperList = new List('papers', listOptions, []);

  let papers = []

  var names = ['Frank', 'Tom', 'Peter', 'Mary'];

  var ul = d3.select('.list');



  function paperListAdd(list) {
    
    ul.append('h3').attr('id', 'paperCount').text(list.length + " Publications")
    
    ul.selectAll('li')
      .data(list)
      .enter()
      .append('li')
      .append('h3')
      .append('a')
      .text(function(d){return d.Title + ", " + d.Year})
      .attr('href', function(d){return d.Link})
      .attr('target', "_blank")
    
    ul.selectAll('li')
      .append('h4')
      .text(function(d){return d.Year + " Citations Aminer: " + d['AminerCitationCount_02-2019'] + " Xplore: " + d['XPloreCitationCount_02-2019']})
      
    ul.selectAll('li')
      .append('h4')
      .text(function(d){
       let authors = ""
       let authorsList = d['AuthorNames-Deduped'].split(";")
       for (let i = 0; i < authorsList.length; i++){
         if (i == authorsList.length - 1){
           authors += authorsList[i]
         }
         else{
           authors += authorsList[i] + ", "
         }
         
       }
       
       return authors;
      });
  }
  
  function paperListRemove() {
    ul.selectAll('#paperCount').remove();
    ul.selectAll('li').remove();
  }

  dispatch.on('authorHighlighted.panel', function (author, selections) {

    if (selections.clickedNodes.length == 0) {


      for (i = 0; i < author.paperIndex.length; i++) {
        papers.push(allPapers[author.paperIndex[i]]);
      }
      
      paperListAdd(papers);
      
    }

  });

  dispatch.on('authorUnhighlighted.panel', function (selections) {
    if (selections.clickedNodes.length == 0) {
      papers = []
      paperListRemove();
    }
  });

  dispatch.on('authorClicked.panel', function (author, selections) {

    if (selections.searchResults.length == 0) {
      for (i = 0; i < author.paperIndex.length; i++) {
        if (papers.indexOf(allPapers[author.paperIndex[i]]) < 0) {
          papers.push(allPapers[author.paperIndex[i]]);
        }
      }

      paperListRemove();
      paperListAdd(papers);
    }
  })

  dispatch.on('authorUnClicked.panel', function (selections) {
    papers = []
    paperList.clear();
  })

  dispatch.on('search.panel', function (selections) {
    if (selections.search == '') {
      papers = []
      paperListRemove();
    } else {
      paperListRemove();
      paperListAdd(selections.searchResults);
    }
  })

});
