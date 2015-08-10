var tournamentService = require('../services/tournament');

module.exports = function(io) {
	var challongeIO = io.of('/challonge');

	challongeIO.on('connection', function(socket) {

		tournamentService.getTournaments(function(tournaments) {
			socket.emit('tournament list', tournaments);
		});

		socket.on('tournament add', function(tournamentName) {
			tournamentService.addTournament(tournamentName, function(tournaments) {
				socket.emit('tournament list', tournaments);
			});
		});
	});
};
