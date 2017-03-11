var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');

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

/*var articles = {
	'article-one': {
		title: 'Article-one | Sourab M',
		heading: 'Article-one',
		date: 'Feb 26,2017',
		content: `
			    <p>This is the content of the first article.This is the content of the first article.This is the content of the first article.This is the content of the first article.</p>
		        <p>This is the content of the first article.This is the content of the first article.This is the content of the first article.This is the content of the first article.</p>
		        <p>This is the content of the first article.This is the content of the first article.This is the content of the first article.This is the content of the first article.</p>`
	},
	'article-two': {
		title: 'Article-two | Sourab M',
		heading: 'Article-two',
		date: 'Feb 27,2017',
		content: `<p>This is the content of the second article.</p>`
	},
	'article-three': {
		title: 'Article-three | Sourab M',
		heading: 'Article-three',
		date: 'Feb 28,2017',
		content: `<p>This is the content of the third article.</p>`
	}
	
};	*/

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
					</div>
				    </body>
				</html>`;
	return htmlTemplate;

}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
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
                res.send("Credential correct!")
            }
            else {
                res.status(403).send("username/password is invalid");
            }
        }
      
    });
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


var counter=0;
app.get('/counter', function(req,res) {
    counter=counter+1;
    res.send(counter.toString());
});

var names = [];
app.get('/submit-name', function(req,res) { //  /submit-name?name=xxxx
    //get the name from the request
    var name = req.query.name;
    
    names.push(name);
    //JSON: JavaScript ObjectNotation
    res.send(JSON.stringify(names)); //response to the web browser
});

app.get('/articles/:articleName', function (req, res) {
  //articleName == article-one
  //articles[articleName] == {} contents object for article-one
  /*var articleName = req.params.articleName;  
  res.send(createTemplate(articles[articleName]));*/
  
  pool.query("SELECT * FROM article WHERE title = $1" , [req.params.articleName] , function(err,result){
      if(err) {
          res.status(500).send(err.toString());
      }
      else if(result.rows.length === 0) {
          res.status(404).send('Article not found');
      }
      else
      {
          var articleData = result.rows[0];
           res.send(createTemplate(articleData));
      }
  });
  
 });
 




/*app.get('/article-two', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'article-two.html'));
});

app.get('/article-three', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'article-three.html'));
});*/

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
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
