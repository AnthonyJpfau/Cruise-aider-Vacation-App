var fs = require('fs');
var http = require('http');


var filePath = "./";

let server = http.createServer(function (req, res) {
  console.log(req.headers);
  let baseURL = 'http://' + req.headers.host;
  var urlOBJ = new URL(req.url, baseURL);

  console.log("Method: " + req.method);
  console.log(urlOBJ);

  // If the client requests the root path, serve the "homepage.html" file
  let requestedFile = urlOBJ.pathname === '/' ? 'homepage.html' : urlOBJ.pathname;

  fs.readFile(filePath + requestedFile, function(err, data) {
    if (err) {
      res.writeHead(404);
      res.write("<h1> ERROR 404. FILE NOT FOUND</h1><br><br>");
      res.end(JSON.stringify(err));
    }
    res.writeHead(200);
    res.end(data);
  });
}).listen(3000, ()=>{
  console.log("Server is running");
});

/*
app.post('/login', async (req, res) => {
  const {username, password} = req.body;

  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    //replace with our SQL database name v v
    const db = client.db('battleshipDb');
    const users = db.collection('users');

    const user = await users.findOne({username, password});

    if(user) {
      req.session.username = username;
      res.redirect('/gamepage.html');
    
    } else {
      res.status(401).send('Incorrect username or password');
    }

    client.close();
  } catch (error) {
    console.error('Error connecting to the database', error);
    res.status(500).send('Internal server error');
  }
});

Code needs to be modified to Fit SQL database informaion

*/
/*

app.post('/register', async (req, res) => {
  const {username, password, email} = req.body;

  try {
    const client = await MongoClient.connect(uri, { usenewUrlParser: true, useUnifiedTopology: true});
    const db = client.db('battleshipDb');
    const users = db.collection('users');

    //insert new user to battleship user collection
    const existingUser = await users.findOne({ $or: [{username }, { email}] });

    if (existingUser) {
      //if username or email already exists, send an error
      res.status(409).send("Username or email already exists. <br><a href='/'>Go back</a>");
      
    } else {
      const newUser = {
        username,
        password,
        email,
        wins: 0,
        losses: 0,
        totalShipsSunk: 0,
      };
      await users.insertOne(newUser);
      req.session.username = username;
      client.close();
      //if username/email doesnt exist Creates account
      res.redirect('/gamepage.html');
    }



   
  } catch(error) {
    console.error('Error connecting to the database', error);
    res.status(500).send('Internal Server Error');
  }

});

CODE needs to be modifed to fit SQL database information
*/