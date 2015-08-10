var tournamentService = require('../services/tournament');

module.exports = function(io) {
	var tournamentIo = io.of('/tournament');

	tournamentIo.on('connection', function(socket) {
		console.log('new socket');
	});
};
