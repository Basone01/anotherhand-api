const socketIO = require('socket.io');

const applySocketIO = (server) => {
	const io = socketIO.listen(server);
	io.on('connection', function(socket) {
		console.log('someone has connected');
		socket.on('subscribe_shop_event', function(payload) {
			socket.join(payload.fb_page_id, (err) => {
				if (err) {
					console.log(err);
					return;
				}
				console.log('Subscribe ID: ' + payload.fb_page_id);
			});
		});
	});

	io.on('disconnect', function() {
		console.log('Someone Disconnected');
	});

	return io;
};

module.exports = applySocketIO;
