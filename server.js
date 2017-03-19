var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
    user: 'pacman100',
    database : 'pacman100',
    host : 'db.imad.hasura-app.io',
    port : '5432',
    password : 'db-pacman100-48236'//process.env.DB_PASSWORD
    
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret:'someRandomSecretValue',
    cookie: {maxAge: 1000*60*60*24*30}
}));

function createTemplate2(data) {
    var title=data.title;
	var heading=data.heading;
	var date=data.date;
	var content=data.content;
	
	var htmlTemplate = `<html>
                            <head>
                                <title>${title}</title>
                                <meta name="viewport" content="width=device-width , initial-scale=1"/>
                                <meta charset="UTF-8">
                                <link href="/ui/style.css" rel="stylesheet" />
                                <link rel="stylesheet" href="https://www.w3schools.com/w3css/3/w3.css">
                                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway">
                                <style>
                                body,h1,h2,h3,h4,h5 {font-family: "Raleway", sans-serif}
                                </style>
                             </head>
                            
                            <body class="w3-light-grey">
                        
                            <!-- w3-content defines a container for fixed size centered content, 
                            and is wrapped around the whole page content, except for the footer in this example -->
                            <div class="w3-content" style="max-width:1400px">
                                <div class="w3-card-4 w3-margin w3-white">
                                <div class="container">
                                    <div>
                					    <a href='/'> HOME </a>
                					</div>
                				    <hr/>
                                   <!-- <div class="center">
                                        <img src="ui/madi.png" alt="Nature" class="img-medium">
                                    </div>-->
                                    <div class="w3-container w3-padding-8">
                                        <h3><b>${heading}</b></h3>
                                        <span class="w3-opacity">${date.toDateString()}</span></h5>
                                    </div>
                        
                                    <div class="w3-container">
                                        <p>${content}</p>
                                    	<hr/>
                                        <h4>Comments</h4>
                                        <div id="comment_form">
                                        </div>
                                        <div id="comments">
                                            <center>Loading comments...</center>
                                        </div>
                                        <script type="text/javascript" src="/ui/article.js"></script>
                                    </div>
                                </div>
                                </div>
                            </div>
                           </body>
                        </html>`;
    return htmlTemplate;
}


function createTemplate(data) {
	var title=data.title;
	var heading=data.heading;
	var date=data.date;
	var content=data.content;
	
	var htmlTemplate = `
				<html>
				    <head>
					<title>${title}</title>
					<meta name="viewport" content="width=device-width , initial-scale=1"/>
				 	<link href="/ui/style.css" rel="stylesheet" />
				    </head>
				    
				    <body>
					<div class="container">
					    <div>
					    <a href='/'> HOME </a>
					    </div>
					    <hr/>
					    <h3>${heading}</h3>
					    <div>${date.toDateString()}</div>
					    <div>${content}</div>
				    	<hr/>
                        <h4>Comments</h4>
                        <div id="comment_form">
                        </div>
                        <div id="comments">
                            <center>Loading comments...</center>
                        </div>
                    </div>
                    <script type="text/javascript" src="/ui/article.js"></script>
				    </body>
				</html>`;
	return htmlTemplate;

}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/blog', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'blog.html'));
});

function hash( input, salt) {
    var hashed_string = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed_string.toString('hex')].join('$');
}

 app.get('/hash/:input', function (req, res) {
    var hashed_string = hash(req.params.input, "this-is-some-random-string");
    res.send(hashed_string);
});

var pool = new Pool(config);

app.post('/create-user', function (req, res) {
    //username,password
    //JSON
    //'{"username": "xyz","password": "fddf"}'
    var username = req.body.username;
    var password = req.body.password;   
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password, salt);
    pool.query("INSERT INTO user_db (username, password) VALUES ($1, $2)", [username, dbString], function(err, result){
        if(err) {
          res.status(500).send(err.toString());
      } else {
          //return a response with the result
          res.send("User created successfully: " + username);
      }
      
    });
});

app.post('/login-user', function (req, res) {
    //username,password
    //JSON
    //'{"username": "xyz","password": "fddf"}'
    var username = req.body.username;
    var password = req.body.password;   
    
    pool.query("SELECT * FROM user_db WHERE username=$1" ,[username], function(err, result){
        if(err) {
          res.status(500).send(err.toString());
        }
        else if(result.rows.length === 0){
          //return a response with the result
          res.status(403).send("username/password is invalid ");
        }
        else{
            //Match the password
            var dbString = result.rows[0].password;
            var salt = dbString.split('$')[2];
            var hashed_password = hash(password, salt);
            if(hashed_password === dbString) {
                
                //set a session
                req.session.auth = {userId: result.rows[0].id};
                //sets cookie with session id
                //internally on the server side, it maps this session id to the object
                //{auth: {userId}}
                
                res.send("Credential correct!");
            }
            else {
                res.status(403).send("username/password is invalid");
            }
        }
      
    });
});

app.get('/check-login' , function(req,res){
    
    if(req.session && req.session.auth && req.session.auth.userId) {
       
       pool.query("SELECT * FROM user_db WHERE id=$1", [ req.session.auth.userId], function(err, result) {
           if(err) {
               res.status(500).send(err.toString());
           }
           else {
               res.send(JSON.stringify(result.rows[0].username));
           }
       });
    }
    else
    {
        res.status(400).send("you are not logged in");
    }
});

app.get('/logout-user' , function(req,res){
    delete req.session.auth;
    res.send("<html><body><div class='center'>Logged out successfully!</div><hr/><br><br><a href='/'>HOME</a></body></html>");
});

app.get('/test-db', function (req, res) {
  //make a select request to the databse
  pool.query('SELECT * FROM test' , function(err , result) {
      if(err) {
          res.status(500).send(err.toString());
      } else {
          //return a response with the result
          res.send(JSON.stringify(result.rows));
      }
  });
  
});


app.get('/get-articles', function (req, res) {
    
    pool.query("SELECT * FROM article_db  ORDER BY date DESC", function(err, result) {
        if(err) {
            res.status(500).send(err.toString());
        }
        else if(result.rows.length === 0) {
            res.status(404).send('No articles found');
        }
        else {
            res.send(JSON.stringify(result.rows));
        }
  });
});


app.get('/articles/:articleName', function (req, res) {
  //articleName == article-one
  //articles[articleName] == {} contents object for article-one
  /*var articleName = req.params.articleName;  
  res.send(createTemplate(articles[articleName]));*/
  
  pool.query("SELECT * FROM article_db WHERE title = $1" , [req.params.articleName] , function(err,result){
      if(err) {
          res.status(500).send(err.toString());
      }
      else if(result.rows.length === 0) {
          res.status(404).send('Article not found');
      }
      else
      {
          var articleData = result.rows[0];
           res.send(createTemplate2(articleData));
      }
  });
  
 });
 
 app.get('/get-comments/:articleName', function (req, res) {
   // make a select request
   // return a response with the results
   pool.query(`SELECT c.user_id,c.article_id,c.t_stamp,c.comment, u.username FROM article_db a, comment_db c, user_db u WHERE a.title = $1 AND a.id = c.article_id AND c.user_id = u.id ORDER BY c.t_stamp DESC`, [req.params.articleName], function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
          res.send(JSON.stringify(result.rows));
      }
   });
});

app.post('/submit-comment/:articleName', function (req, res) {
   // Check if the user is logged in
    if (req.session && req.session.auth && req.session.auth.userId) {
        // First check if the article exists and get the article-id
        console.log("user logged in :"+req.session.auth.userId);
        pool.query('SELECT * from article_db where title = $1', [req.params.articleName], function (err, result) {
            if (err) {
                res.status(500).send(err.toString());
            } else {
                if (result.rows.length === 0) {
                    res.status(400).send('Article not found');
                } else {
                    var articleId = result.rows[0].id;
                    // Now insert the right comment for this article
                    pool.query(
                        "INSERT INTO comment_db (comment, article_id, user_id) VALUES ($1, $2, $3)",
                        [req.body.comment, articleId, req.session.auth.userId],
                        function (err, result) {
                            if (err) {
                                res.status(500).send(err.toString()+"tu chutiya hai");
                                console.log("tu chutiya hai");
                            } else {
                                res.status(200).send('Comment inserted!')
                            }
                        });
                }
            }
       });     
    } else {
        res.status(403).send('Only logged in users can comment');
    }
});
 

/*app.get('/article-two', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'article-two.html'));
});

app.get('/article-three', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'article-three.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

app.get('/ui/s.jpg', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 's.jpg'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});*/

app.get('/ui/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', req.params.fileName));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
