async function connectToWorld(port) {
	const ngrok = require('ngrok');
	const { authToken } = require('./ngrokAuthToken');
	var url;

	try {
		url = await ngrok.connect({
			addr: port || 80,
			authtoken: authToken,
			onStatusChange: (status) => {
				if (status == "closed") {
					console.log("Connection Lost, Trying To Reconnect...")
				} else {
					console.log("NGROK Started, Starting Tunneling...");
				}
			}
			// onTerminated: () => console.log("NGROK Session Ended...")
		});

		console.log("Public URL: " + url);
	} catch (err) {
		console.log("NGROK ERROR: " + err.body.msg);
	}
}

module.exports = connectToWorld