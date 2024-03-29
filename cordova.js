var bliss = new (require('bliss'))();
var http = require('http');
var fs = require('fs');
var route = require('router')();
var querystring = require('querystring');
var path = require('path');

appPath = '';
devices = {}

/* Configuration page */
route.get('/config', function(req, res) {
    content=bliss.render('config');
    render(res, content);
});

route.post('/config', function(req, res) {
    configuration(req, res);
});

route.post('/connect', function(req, res) {
    connect(req, res);
});

route.get('/devices', function(req, res) {
	cnt = 0;
	for (i in devices) cnt++;
	content=bliss.render('devices', devices);
    render(res, content);
});

route.post('/reload', function(req, res) {
	console.log("Start reload of devices");
	res.writeHead(200);
	res.end();
	for (i in devices) {
		console.log("Send reload to " + i);
		
		var options = {
		  host: i,
		  port: 1337,
		  path: '/reload',
		  method: 'GET'
		};

		var reqHttp = http.request(options, function(res) {
		  res.setEncoding('utf8');
		  res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		  });
		});
		
		reqHttp.on('error', function(e) {
		  console.log('problem with request: ' + e.message);
		});

		// write data to request body
		reqHttp.end();
	}
});

/* Index page */
route.get('/', function(req, res) {
	appName = path.basename(appPath);
    content=bliss.render('home', appPath, appName);
    render(res, content);
});

/* generic */
route.get(function(req, res){
    // no route was matched
    
    // 1) try lo laod file 
    var foundIt = loadFile('.' + req.url, res);
    
    if (foundIt) return;
    
    // 2) try to load from the application
    if (!loadFile(appPath + req.url, res)) {
    	res.writeHead(404);
    	renderErrorMessage(res, "404 File not found", "The file " + req.url + " is not present");
    }
});

laodConfig();
http.createServer(route).listen(1337);
console.log('Server running at http://127.0.0.1:1337/');

/* Configuration task */ 
function configuration(req, res){
	var fullBody = '';
    req.on('data', function(chunk) {
      // append the current chunk of data to the fullBody variable
      fullBody += chunk.toString();
    });
    
    req.on('end', function() {
    	var query = querystring.parse(fullBody);
    	console.log("\tStart check configuration of " + query.path);
    	
    	// validate 
    	checkApplication(query.path, res);
    });

}

function checkApplication(pathFile, res){
	path.exists(pathFile + "/index.html", function(exists) {
			if (exists) {
				console.log("\tFound index page");
				renderMessage(res, 'Configuration load success');
				saveConfig(pathFile);
				return;
			}
			renderErrorMessage(res, 'Configuration error', 'Missing index.html file');
	});
}

function saveConfig(pathFile){
	console.log("\twWrite configuration to file")
	appPath = pathFile;
	fs.writeFileSync('config.dat', pathFile);
}

function laodConfig(){
	try{
		console.log('Load config file: config.dat');
		content = fs.readFileSync('config.dat');
		appPath = content;
		console.log('Found a valid application at: ' + content);
	}
	catch(err) {
		console.log("Warning: missing config file");
	}
}

/* Connect */
function connect(req, res){
	console.log("Recved connection from device: " + req.connection.remoteAddress);
	devices[req.connection.remoteAddress] = '';
	res.end("OK");
}

/* Render function util */
function renderErrorMessage(res, title, customMessage){
	if (res != undefined) {
		message='<h1>' + title + ' !!!</h1><div class="alert alert-error"><strong>Error!!</strong> ' + customMessage + '</div>';
		content=bliss.render('message', message);
		render(res, content);
	}
}
function renderMessage(res, txt){
	if (res != undefined) {
		message='<h1>' + txt + '</h1>';
		content=bliss.render('message', message);
		render(res, content);
	}
}
function render(res, content){
    output = bliss.render('layout', content);
    res.end(output);
}

function loadFile(path, res) {

  // Remove spash
  var index = path.lastIndexOf('.');
  
  var ext = null;
  
  if (index != -1) {
     ext = path.substr(index+1, path.lenght);
  }
      
  try{
    console.log("Load file: " + path + " and extention of: " + ext);
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
      console.log("Load file: " + path + " with error: " + err + " !!!");
  }
  return false;
}
