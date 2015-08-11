var tournamentService = require('../services/tournament');

module.exports = function(io) {
	var tournamentListIo = io.of('/tournamentList');

	tournamentListIo.on('connection', function(socket) {
        // Log the new connection
        console.log('tournament-list user connected: ' + socket.handshake.address + ' -> ' + socket.request.headers.referer);

		tournamentService.getTournaments(function(tournaments) {
			tournamentListIo.to(socket.id).emit('tournament list', tournaments);
		});

		socket.on('tournament add', function(tournamentName) {
			tournamentService.addTournament(tournamentName, function(tournaments) {
				tournamentListIo.emit('tournament list', tournaments);
			});
		});

		socket.on('tournament remove', function(tournamentName) {
			tournamentService.removeTournament(tournamentName, function(tournaments) {
				tournamentListIo.emit('tournament list', tournaments);
			});
		});
	});
};
