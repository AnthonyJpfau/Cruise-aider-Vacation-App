var fs = require('fs');
var http = require('http');


var filePath = "./";

let server = http.createServer(function (req, res) {
  console.log(req.headers);
  let baseURL = 'http://' + req.headers.host;
  var urlOBJ = new URL(req.url, baseURL);

  console.log("Method: " + req.method);
  console.log(urlOBJ);

  // If the client requests the root path, serve the "index.html" file
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