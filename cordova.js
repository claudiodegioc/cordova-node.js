var http = require('http');

var fs = require('fs');

http.createServer(function (req, res) {

  console.log("Recived request for: " + req.url + " and method: "+ req.method);
  
  var flag = dispacher(req, res);
  
  if (flag)
  	  return;
  res.writeHead(404);
  console.log("\tFile not found !!!");
  res.end("<h1>File not found !!!</h1>");
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');

function dispacher(req, res) {
	
	if (req.method = "POST") {
		
	}
	
	return loadFile("." + req.url, res);
}

function configuration(req, res){

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
