var http = require('http');
var fs = require('fs');

http.createServer(function (req, res) {
  var url = "public" + (req.url.endsWith("/") ? req.url + "index.html" : req.url);
  if (fs.existsSync(url)) {
    fs.readFile(url, (err, data) => {
      if (!err) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  }
}).listen(3000);

console.log('Server running at http://localhost:3000/');