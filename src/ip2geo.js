const ipRegex = require('ip-regex')
const iplocate = require('node-iplocate');
const { Command } = require('commander');

const program = new Command();
program.name("ip2geo")
program.option('-i, --ip <IP-Address>', "Don't use default NGROK service for tunneling (Default false).")
var args = program.parse(process.argv).opts()

if (args.ip) {
	const ipAddr = args.ip
	if (ipRegex({exact: true}).test(ipAddr) != true) {
		console.log("Given IP is invalid!");
		exit(1)
	} else {
		iplocate(ipAddr).then((results) => {
			console.log(results);
		});		
	}
} else {
	console.log("Error: IP Address is Required!");
	program.help()
}