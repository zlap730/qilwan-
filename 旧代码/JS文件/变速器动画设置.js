function showDiv(divId) {
    var div = document.getElementById(divId);
    if (div) {
      div.style.visibility = 'visible';
      div.style.opacity = '1';
    }
}

function hideDiv(divId) {
    var div = document.getElementById(divId);
    if (div) {
        
        div.style.opacity = '0';
    }
}
