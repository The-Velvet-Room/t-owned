var redis = require('redis');
var client = redis.createClient();

var tournamentBaseKey = 't-owned-tournament-';
var tournamentList = tournamentBaseKey + 'list';

var TournamentService = function TournamentService() {
	var emptyArray = JSON.stringify({});
    client.set(tournamentList, emptyArray, 'NX', function(err) {
        if (err) {
            console.log(err);
        }
    });
};

function getTournamentInfoKey(tournamentName) {
	return tournamentBaseKey + 'info-' + tournamentName;
}

TournamentService.prototype.getTournaments = function(callback) {
	client.get(tournamentList, function(err, reply) {
		var tournaments = JSON.parse(reply);
		if (callback) {
			callback(tournaments);
		}
	});
};

TournamentService.prototype.addTournament = function(tournamentName, callback) {
	client.get(tournamentList, function(err, reply) {
		var tournaments = JSON.parse(reply);
		tournaments[tournamentName] = true;
		client.set(tournamentList, JSON.stringify(tournaments), function() {
			if (callback) {
				callback(tournaments);
			}
		});
	});
};

TournamentService.prototype.removeTournament = function(tournamentName, callback) {
	client.get(tournamentList, function(err, reply) {
		var tournaments = JSON.parse(reply);
		delete tournaments[tournamentName];
		client.set(tournamentList, JSON.stringify(tournaments), function () {
			if (callback) {
				callback(tournaments);
			}
		});
	});
};

TournamentService.prototype.getTournamentInfo = function(tournamentName, callback) {
	client.get(getTournamentInfoKey(tournamentName), function(err, reply) {
		if (err) {
			console.log(err);
		} else if (callback) {
			return callback(JSON.parse(reply));
		}
	});
};

TournamentService.prototype.setTournamentInfo = function(tournamentName, tournamentInfo, callback) {
	var stringInfo = JSON.stringify(tournamentInfo);
	client.set(getTournamentInfoKey(tournamentName), stringInfo, function(err) {
		if (err) {
			console.log(err);
		} else if (callback) {
			return callback(tournamentInfo);
		}
	});
};

module.exports = new TournamentService();