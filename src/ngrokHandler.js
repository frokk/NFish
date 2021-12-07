async function connectToWorld(port) {
	const ngrok = require('ngrok');
	const url = await ngrok.connect({
		addr: port || 80,
		onStatusChange: (status) => {
			if (status == "closed") {
				console.log("Connection Lost, Trying To Reconnect...")
			} else {
				console.log("NGROK Started, Getting Public URL...");
			}
		},
		onTerminated: () => console.log("NGROK Session Ended...")
	});

	console.log("Public URL: " + url);
}

module.exports = connectToWorld