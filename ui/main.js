/*console.log('Loaded!');
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
    var interval = setInterval(moveRight , 50);
}*/


//couonter logic
var button = document.getElementById('counter');
 var counter=0;
button.onclick = function(){
    //Make a request to counter endpoint
    
    //Capture the response and store it in a variable
    
    //Render the variable in correct span
   
    var span= document.getElementById('count');
    counter=counter+1;
    span.innerHTML = counter.toString();
}

