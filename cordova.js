var bliss = new (require('bliss'))();
var http = require('http');
var fs = require('fs');
var route = require('router')();

/* Confinguration page */
route.get('/config', function(req, res) {
    res.writeHead(200);
    output = bliss.render('config');
    res.end(output);
});

/* Index page */
route.get('/', function(req, res) {
    res.writeHead(200);
    output = bliss.render('home');
    res.end(output);
});

/* generic */
route.get(function(req, res){
    // no route was matched
    if (!loadFile('.' + req.url, res)) {
    	res.writeHead(404);
    	res.end("File not found");
    }
});

http.createServer(route).listen(1337);

console.log('Server running at http://127.0.0.1:1337/');

function configuration(req, res){
	console.log("\tStart configuration");
	
	var fullBody = '';
    req.on('data', function(chunk) {
      // append the current chunk of data to the fullBody variable
      fullBody += chunk.toString();
    });
    
    req.on('end', function() {
    	return loadFile('./config.ok.html', res);
    });
	  
	//res.end("<h1>Wip !!!</h1>");
}

function loadFile(path, res) {

  // Remove spash
  var index = path.lastIndexOf('.');
  
  var ext = null;
  
  if (index != -1) {
     ext = path.substr(index+1, path.lenght);
  }
      
  try{
    console.log("\tLoad file: " + path + " and extention of: " + ext);
    content = fs.readFileSync(path);
    if (ext != null) {
    	res.writeHead(200, {'Content-Type': 'text/' + ext});
    } else {
    	res.writeHead(200, {'Content-Type': 'text/plain'});
    }
    res.end(content);
    return true;
  }
  catch(err) {
      console.log("\tLoad file: " + path + " with error: " + err + " !!!");
  }
  return false;
}
