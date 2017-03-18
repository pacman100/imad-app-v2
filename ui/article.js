// Eg: pacman100.imad.hasura-app.io/articles/article-one will result in article-one
var currentArticleTitle = window.location.pathname.split('/')[2];


function loadCommentForm() {
    var comment_HTML = `
                        <h5>Submit Comment</h5>
                        <textarea rows='5' columns='100' id='comment_text' placeholder='Enter your comment here....'> </textarea>
                        <br>
                        <input type='submit' value='Submit' id='submit_btn'/>
                        <hr>
                        `;
    document.getElementById('comment_form').innerHTML = comment_HTML;
    
    //logic for submit button
    var submit_btn = document.getElementById('submit_btn');
    submit_btn.onclick = function() {
        
        //create a request object
        var request = new XMLHttpRequest();
        
        //catch the response and store it in a variable
        request.onreadystatechange = function() {
            if(request.readyState === XMLHttpRequest.DONE) {
                //take some action
                if(request.status === 200){
                    //clear comment_area and load all the comments
                     document.getElementById('comment_text').innerHTML='';
                     loadComments();
                }
                else {
                    alert('Error! Could not submit comment');
                }
                
                submit_btn.value = 'Submit';
            }
            //request not processed yet
        };
        
        
        //make the request
        var comment = document.getElementById('comment_text');
        request.open('POST', '/submit-comment/'+currentArticleTitle, true);
        request.setRequestHeader('Content-Type','application/json');
        request.send(JSON.stringify({comment: comment}));
        submit_btn.value = 'Submitting...';
    };
}

function loadLogin() {
    //check if user is already loggged in
    
    //create a request object
    var request = new XMLHttpRequest();
    
    //capture response and store it in variable
    request.onreadystatechange = function() {
        if(request.readyState === XMLHttpRequest.DONE) {
            //take some action 
            if(request.status === 200) {
                loadCommentForm();
            }
        }
    };
    
    //make the request
    request.open('GET','/check-login',true);
    request.send(null);
}

function escapeHTML (text)
{
    var $text = document.createTextNode(text);
    var $div = document.createElement('div');
    $div.appendChild($text);
    return $div.innerHTML;
}

function loadComments() {
    
     //create a request object
    var request = new XMLHttpRequest();
    
     //catch the response and store it in a variable
        request.onreadystatechange = function() {
            if(request.readyState === XMLHttpRequest.DONE) {
                //take some action
                if(request.status === 200){
                    var content = '';
                    var commentData = JSON.parse(request.responseText);
                    for(var i=0;i<commentData.length;i++) {
                        var date = new Date(commentData[i].timestamp);
                        content =`
                                    <div class='comment'>
                                        <p>${escapeHTML(commentData[i].comment)}</p>
                                        <div class='commenter'>
                                            ${commentsData[i].username} - ${time.toLocaleTimeString()} on ${time.toLocaleDateString()} 
                                        </div>
                                    </div>`;
                    }
                comments.innerHTML = content;
                }
                else if(request.status === 404) {
                    comments.innerHTML = 'No comments to show';
                }
                else {
                    comments.innerHTML='Oops! Could not load comments!';
                }
            }
            //request not yet processed;
        };
        request.open('GET', '/get-comments/' + currentArticleTitle, true);
        request.send(null);
}


// The first thing to do is to check if the user is logged in!
loadLogin();
loadComments();