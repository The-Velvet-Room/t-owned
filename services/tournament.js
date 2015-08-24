var redis = require('redis');
var client = redis.createClient();

var tournamentBaseKey = 't-owned-tournament-';
var tournamentList = tournamentBaseKey + 'list';

var TournamentService = function TournamentService() {
	var emptyArray = JSON.stringify({});
    client.setnx(tournamentList, emptyArray, function(err) {
        if (err) {
            console.log(err);
        }
    });
};

function getTournamentInfoKey(tournamentName) {
	return tournamentBaseKey + 'info-' + tournamentName;
}

function getTournamentChallongeKey(tournamentName) {
	return tournamentBaseKey + 'challonge-' + tournamentName;
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
		var defaultTournament = {
			setups: [],
		};
		tournaments[tournamentName] = true;
		client.set(tournamentList, JSON.stringify(tournaments), function() {
			if (callback) {
				callback(tournaments);
			}
		});
		client.set(getTournamentInfoKey(tournamentName), JSON.stringify(defaultTournament));
	});
};

TournamentService.prototype.removeTournament = function(tournamentName, callback) {
	client.get(tournamentList, function(err, reply) {
		var tournaments = JSON.parse(reply);
		delete tournaments[tournamentName];
		client.set(tournamentList, JSON.stringify(tournaments), function() {
			if (callback) {
				callback(tournaments);
			}
		});
		client.del(getTournamentInfoKey(tournamentName));
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

TournamentService.prototype.getChallongeUrl = function(tournamentName, callback) {
	client.get(getTournamentChallongeKey(tournamentName), function(err, reply) {
		if (err) {
			console.log(err);
		} else if (callback) {
			return callback(reply);
		}
	});
};

TournamentService.prototype.setChallongeUrl = function(tournamentName, url, callback) {
	client.set(getTournamentChallongeKey(tournamentName), url, function(err) {
		if (err) {
			console.log(err);
		} else {
			callback(url);
		}
	});
};

TournamentService.prototype.addSetup = function(tournamentName, callback) {
	var _this = this;
	_this.getTournamentInfo(tournamentName, function(info) {
		var newInfo = info === null ? {} : info;
		newInfo.setups = newInfo.setups || [];
		newInfo.setups.push({
			status: 'Open'
		});
		_this.setTournamentInfo(tournamentName, newInfo, function() {
			if (callback) {
				callback(newInfo);
			}
		});
	});
};

TournamentService.prototype.assignSetup = function(tournamentName, setupId, matchId, callback) {
	var _this = this;
	_this.getTournamentInfo(tournamentName, function(info) {
		var newInfo = info === null ? {} : info;
		if (newInfo.setups && newInfo.setups[setupId]) {
			newInfo.setups[setupId].status = 'Assigned';
			newInfo.setups[setupId].matchId = matchId;
		}
		_this.setTournamentInfo(tournamentName, newInfo, function() {
			if (callback) {
				callback(newInfo);
			}
		});
	});
};

TournamentService.prototype.openSetup = function(tournamentName, setupId, callback) {
	var _this = this;
	_this.getTournamentInfo(tournamentName, function(info) {
		var newInfo = info === null ? {} : info;
		if (newInfo.setups && newInfo.setups[setupId]) {
			newInfo.setups[setupId].status = 'Open';
			newInfo.setups[setupId].matchId = null;
		}
		_this.setTournamentInfo(tournamentName, newInfo, function() {
			if (callback) {
				callback(newInfo);
			}
		});
	});
};

module.exports = new TournamentService();
