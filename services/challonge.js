var config = require('../config');
var request = require('request');
var redis = require('redis');
var pmx = require('pmx');

var client = redis.createClient();

var challongeExpireSeconds = 8;
var challongeApiRoot = 'https://api.challonge.com/v1';
var challongeBaseKey = 'challonge-';

var ChallongeService = function ChallongeService() { };

function getChallongeTournamentKey(challongeHash) {
    return challongeBaseKey + 'tournament-' + challongeHash;
}

ChallongeService.prototype.getChallongeHash = function getChallongeHash(challongeUrl) {
    var tourneyHash = challongeUrl.substring(challongeUrl.lastIndexOf('/') + 1).trim();
    var orgHash;

    // If tournament belongs to an organization,
    // it must be specified in the request
    if (challongeUrl.split('.').length - 1 > 1) {
        orgHash = challongeUrl.substring(challongeUrl.lastIndexOf('http://') + 7, challongeUrl.indexOf('.'));
        return orgHash + '-' + tourneyHash;
    }

    // Standard tournament
    return tourneyHash;
};

ChallongeService.prototype.getTournament = function getTournament(tournamentUrl, callback) {
    var challongeHash = this.getChallongeHash(tournamentUrl);
    var challongeKey = getChallongeTournamentKey(challongeHash);
    var options;
    client.get(challongeKey, function(err, reply) {
        if (err) {
            console.error(err);
        } else if (reply) {
            callback(JSON.parse(reply));
        }

        options = {
            url: challongeApiRoot + '/tournaments/' + challongeHash + '.json?include_matches=1&include_participants=1',
            method: 'GET',
            headers: {
                // Basic Auth must be encoded or request will be denied
                'Authorization': 'Basic ' + new Buffer(config.challongeDevUsername + ':' + config.challongeApiKey).toString('base64')
            }
        };

        request(options, function(error, response, body) {
            var challongeTournament;
            var errorMessage;
            if (!error && response && response.statusCode === 200) {
                try {
                    challongeTournament = JSON.parse(body).tournament;
                    client.setex(challongeKey, challongeExpireSeconds, JSON.stringify(challongeTournament));
                    callback(challongeTournament);
                } catch (e) {
                    errorMessage = 'Challonge response could not be parsed: ' + body;
                    console.error(errorMessage);
                    pmx.notify(errorMessage);
                }
            } else {
                errorMessage = 'Error: ' + error + ' Response: ' + response;
                console.error(errorMessage);
                pmx.notify(errorMessage);
            }
        });
    });
};

module.exports = new ChallongeService();
