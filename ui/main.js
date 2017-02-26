console.log('Loaded!');
var element = document.getElementById("main_txt");
element.innerHTML = 'Sourab Mangrulkar';
var para = document.getElementById("para");
para.innerHTML = 'Painting a masterpiece on the canvas of life. :)';
var img = document.getElementById("madi");

var marginLeft = 10;
function moveRight() {
    marginLeft = marginLeft+10;
    img.style.marginLeft = marginLeft + 'px';
}
img.onclick = function() {
    var inter = interval(moveRight , 50);
}

