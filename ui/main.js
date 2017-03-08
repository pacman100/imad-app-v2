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


//counter code
var button = document.getElementById('counter');
button.onclick = function(){
    
    
    //create a request object
    var request = new XMLHttpRequest();
    
    //Capture the response and store it in a variable
    request.onreadystatechange = function() {
        if(request.readyState === XMLHttpRequest.DONE) {
            
            //take some action 
            if(request.status === 200) {
                var counter = request.responseText;
                //Render the variable in correct span
                var span= document.getElementById('count');
                span.innerHTML = counter.toString();
            }
        }
        //not done yet
    };
    
    //Make a request to counter endpoint
    request.open('GET', 'http://pacman100.imad.hasura-app.io/counter', true);
    request.send(null);
};


//comment code
//submit name
var submit = document.getElementById('submit');
submit.onclick = function() {
    
    //create a request object
    var request = new XMLHttpRequest();
    
    //Capture the response and store it in a variable
    request.onreadystatechange = function() {
        if(request.readyState === XMLHttpRequest.DONE) {
            
            //take some action 
            if(request.status === 200) {
                //render the names array list
                var names = request.responseText;
                names = JSON.parse(names);
                var list = '';
                for(var i=0;i<names.length;i++)
                {
                    list+= '<li>' + names[i] + '</li>';
                }
                var ul = document.getElementById('nameslist');
                ul.innerHTML = list;
            }
        }
        //not done yet
    };
    
    //Make a request to counter endpoint
    var nameInput= document.getElementById('name');
    var name = nameInput.value;
    request.open('GET', 'http://pacman100.imad.hasura-app.io/submit-name?name=' + name, true);
    request.send(null);
  
};
