const Panel = (function(dispatch) {
    const element = document.getElementsByClassName('panel')[0];

    dispatch.on('authorHighlighted.panel', function(author) {
        element.innerHTML = author.id;
    });
    dispatch.on('authorUnhighlighted.panel', function() {
        element.innerHTML = '';
    });
});