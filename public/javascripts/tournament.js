var tournamentSocket = io('/tournament');
var challongeSocket = io('/challonge');
var setups = [];
var playerDict = {};
var matchDict = {};
var matchList = [];
var challongeTimeout = null;
var challongeRoom = null;

function getLastPartOfUrl() {
	var partArray = window.location.href.split('/');
	var lastPart = '';
	while (lastPart === '' && partArray.length > 0) {
		lastPart = partArray.pop();
	}
	return lastPart;
}

function getAssignedMatchIds(setupList) {
	var assignedMatchDict = {};
    setupList.forEach(function(setup) {
		if (setup.status === 'Assigned' && setup.matchId) {
			assignedMatchDict[setup.matchId] = true;
		}
    });
    return assignedMatchDict;
}

function getAvailableMatches(matches) {
    var availableMatches = [];
    var assignedMatches = getAssignedMatchIds(setups);
    matches.forEach(function(match) {
        if (match.match.state === 'open' && !assignedMatches[match.match.id]) {
            availableMatches.push(match);
        }
    });
    return availableMatches;
}

function getPlayerDictionary(players) {
    var playerDictionary = {};
    players.forEach(function(player) {
        playerDictionary[player.participant.id] = player.participant.name || player.participant.username;
    });
    return playerDictionary;
}

function getMatchDictionary(matches) {
    var matchDictionary = {};
    matches.forEach(function(match) {
        matchDictionary[match.match.id] = match.match;
    });
    return matchDictionary;
}

function buildSetupSelector(setupList) {
	var $selector = $('<select class="setup-selector"><option value="" disabled selected style="display:none;"></option></select>');
	for (var i = 0; i < setupList.length; i++) {
		if (!setupList[i].status || setupList[i].status === 'Open') {
			$selector.append('<option value=' + (i + 1) + '>' + (i + 1) + '</option>');
		}
	}
	return $selector;
}

function updateMatchList(availableMatches, players) {
	var $matchList = $('#matches-tbody');
	var $setupSelector = buildSetupSelector(setups);
	$matchList.empty();
	availableMatches.forEach(function(match) {
		var tableRow = [];
		var player1Id = match.match.player1_id;
		var player2Id = match.match.player2_id;
		var player1 = players[player1Id];
		var player2 = players[player2Id];
		tableRow.push('<tr class="available-match-row" data-id="' + match.match.id + '"><td>');
		tableRow.push(player1 + ' vs. ' + player2);
		tableRow.push('</td><td>');
		tableRow.push('<div class="setup-selector-wrap"></div>');
		tableRow.push('</td></tr>');
		$matchList.append(tableRow.join(''));
	});
	$('.setup-selector-wrap').append($setupSelector.clone());
}

function updateSetupsList(setupsList) {
	var $setupsList = $('#setups-list');
	$setupsList.empty();
	for (var i = 0; i < setupsList.length; i++) {
		var setup = setupsList[i];
		var $setup = $('<li class="setup-row" data-id="' + (i + 1) + '"></li>');
		$setup.append('<div class="setup-id">' + (i + 1) + '</div>');
		if (setup.status) {
			$setup.append('<div class="setup-status">' + setup.status + '</div>');
		}
		if (setup.status === 'Assigned') {
			var match = matchDict[setup.matchId];
			if (match) {
				if (match.state === 'open') {
					var player1 = playerDict[match.player1_id];
					var player2 = playerDict[match.player2_id];
					$setup.append('<div>' + player1 + ' vs ' + player2 + '</div>');
				} else {
					tournamentSocket.emit('open setup', i);
				}
			}
			$setup.append('<a href="" class="reassign-setup">Reassign</a>');
		}
		$setupsList.append($setup);
	}
}

$(function() {
	$(document).on('change', '.setup-selector', function() {
		var setupIndex = $(this).val() - 1;
		var tableRow = $(this).closest('.available-match-row');
		var matchId = tableRow.data('id');
		tournamentSocket.emit('assign setup', setupIndex, matchId);
	});

	$(document).on('click', '.reassign-setup', function(e) {
		e.preventDefault();
		var tableRow = $(this).closest('.setup-row');
		var setupIndex = tableRow.data('id') - 1;
		tournamentSocket.emit('open setup', setupIndex);
	});

	$('#save-challonge-url').on('click', function() {
		var url = $('#challonge-url').val();
		tournamentSocket.emit('save challonge url', url);
	});

	$('#add-setup').on('click', function() {
		tournamentSocket.emit('add setup');
	});

	challongeSocket.on('room joined', function(room) {
		challongeRoom = room;
	});

	challongeSocket.on('tournament info', function(info) {
		var availableMatchList;

		matchList = info.matches;
		availableMatchList = getAvailableMatches(matchList);
		playerDict = getPlayerDictionary(info.participants);
		matchDict = getMatchDictionary(info.matches);

		updateMatchList(availableMatchList, playerDict);
		updateSetupsList(setups);
		$('.available-match-count').text(availableMatchList.length);

		clearTimeout(challongeTimeout);
		challongeTimeout = setTimeout(function() {
			challongeSocket.emit('request tournament info');
		}, 10000);
	});

	tournamentSocket.on('challonge url', function(url) {
		var $challongeUrl = $('#challonge-url');
		$challongeUrl.val(url);
		if (challongeRoom) {
			challongeSocket.emit('change room', { oldRoom: challongeRoom, newRoom: url });
			// clear the match count
			$('.available-match-count').text('-');
			// clear the matches table
			$('#matches-tbody').empty();
		} else {
			challongeSocket.emit('join room', url);
		}
		clearTimeout(challongeTimeout);
	});

	tournamentSocket.on('tournament info', function(info) {
		var availableMatchList;
		if (!info) {
			return;
		}
		setups = info.setups;
		updateSetupsList(setups);

		availableMatchList = getAvailableMatches(matchList);
		updateMatchList(availableMatchList, playerDict);
		$('.available-match-count').text(availableMatchList.length);
	});

	// Once we have everything set up, let's join the socket.io room
	// for the tournament
	tournamentSocket.emit('join room', getLastPartOfUrl());
});
