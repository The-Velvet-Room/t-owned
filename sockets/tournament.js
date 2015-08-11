var tournamentService = require('../services/tournament');

module.exports = function(io) {
	var tournamentIo = io.of('/tournament');

	tournamentIo.on('connection', function(socket) {
        // Log the new connection
        console.log('tournament user connected: ' + socket.handshake.address + ' -> ' + socket.request.headers.referer);

		tournamentIo.to(socket.id).emit('request room');

		socket.on('join room', function(room) {
			socket.join(room, function() {
				tournamentService.getTournamentInfo(room, function(info) {
					tournamentIo.to(socket.id).emit('tournament info', info);
				});
			});
		});

		socket.on('save challonge url', function(url) {
			var tournament = socket.rooms[socket.rooms.length - 1];
			tournamentService.setChallongeUrl(tournament, url, function(info) {
				tournamentIo.to(tournament).emit('tournament info', info);
			});
		});

		socket.on('add setup', function() {
			var tournament = socket.rooms[socket.rooms.length - 1];
			tournamentService.addSetup(tournament, function(info) {
				tournamentIo.to(tournament).emit('tournament info', info);
			});
		});
	});
};
