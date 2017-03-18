function loadLoginForm() {
    var login_reg_HTML = `
                        <input type="text" placeholder="username" id="username"/>
                        <br>
                        <input type="password" placeholder="password" id="password"/>
                        <br><br>
                        <input type="submit" value="Login" id="login_btn"/>
                        <input type="submit" value="Register" id="register_btn"/>
                        `;
                        
    document.getElementById('login_area').innerHTML = login_reg_HTML;
    
    //submit username & password to login
    var login_btn = document.getElementById('login_btn');
    login_btn.onclick = function() {
        
        //create a request object
        var request = new XMLHttpRequest();
        
        //catch the response and store it in a variable
        request.onreadystatechange = function() {
            
            if(request.readyState === XMLHttpRequest.DONE) {
                //take some action 
                if(request.status === 200) {
                    login_btn.value = "Logged in!";
                }
                else if(request.status === 403) {
                    alert("Invalid Credentials!");
                    login_btn.value = "Login";
                }
                else if(request.status === 500) {
                    alert("Something wrong with server!");
                    login_btn.value = "Login" ;
                }
                else {
                    alert("Something wrong with server!");
                    login_btn.value = "Login" ;
                }
                loadLogin();
            }
            //request not yet processed
        };
     
        //make a request
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        console.log(username);
        console.log(password);
        request.open('POST','/login-user',true);
        request.setRequestHeader('Content-Type','application/json');
        request.send(JSON.stringify({username: username , password: password}));
        login_btn.value = "Logging in...";
    };
    
     //submit username & password to register
    var login_btn = document.getElementById('register_btn');
    login_btn.onclick = function() {
        
        //create a request object
        var request = new XMLHttpRequest();
        
        //catch the response and store it in a variable
        request.onreadystatechange = function() {
            
            if(request.readyState === XMLHttpRequest.DONE) {
                //take some action 
                if(request.status === 200) {
                    alert("User registered successfully.");
                    login_btn.value = "Registered!";
                }
                else {
                    alert("User not registered!");
                    login_btn.value = "Register" ;
                }
            }
            //request not yet processed
        };
        
        //make a request
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        console.log(username);
        console.log(password);
        request.open('POST','/create-user',true);
        request.setRequestHeader('Content-Type','application/json');
        request.send(JSON.stringify({username: username , password: password}));
        login_btn.value = "Registering...";
    };
    
}

function loadLoggedInUser(text) {
    var loginArea = document.getElementById('login_area');
    loginArea.innerHTML = `
        <h3> <i><b>${text}<b/></i> is logged in.</h3>
        <a href="/logout">Logout</a>
    `;
}

function loadLogin( ) {
    //check if user is already loggged in
    
    //create a request object
    var request = new XMLHttpRequest();
    
    //capture response and store it in variable
    request.onreadystatechange = function() {
        if(request.readyState === XMLHttpRequest.DONE) {
            //take some action 
            if(request.status === 200) {
                loadLoggedInUser(request.responseText);
            }
            else {
                loadLoginForm();
            }
        }
    };
    
    //make the request
    request.open('GET','/check-login',true);
    request.send(null);
}

function loadArticles() {
    
    //create a request object
    var request = new XMLHttpRequest();
    
    //catch response and store in variable
    request.onreadystatechange = function() {
        //take some action
        if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
                var content ='<ul>';
                var articleData = JSON.parse(request.responseText);
                for(var i=0;i<articleData.length;i++) {
                    content+=`
                                <li>
                               <a href="/articles/${articleData[i].title}">${articleData[i].heading} </a>
                               (${articleData[i].date.split('T')[0]})
                               </li>`;
                }
                content+='</ul>';
                document.getElementById('articles').innerHTML = content;
            }
            else {
                 document.getElementById('articles').innerHTML = "Couldn't load article list! :(";
            }
        }
         //request not processed yet
    };
    
    //make the request
    request.open('GET','/get-articles',true);
    request.send(null);
}

//First of all check if user is already logged in 
loadLogin();

//Load the article list
loadArticles();