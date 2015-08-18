var tournamentSocket = io('/tournament');
var challongeSocket = io('/challonge');
var setups = [];
var playerDict = {};
var matchDict = {};
var matchList = [];

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
		tableRow.push('<div class="setup-selector"></div>');
		tableRow.push('</td></tr>');
		$matchList.append(tableRow.join(''));
	});
	$('.setup-selector').append($setupSelector.clone());
}

function updateSetupsList(setupsList) {
	var $setupsList = $('#setups-list');
	$setupsList.empty();
	for (var i = 0; i < setupsList.length; i++) {
		var setup = setupsList[i];
		var $setup = $('<li></li>');
		$setup.append('<div class="setup-id">' + (i + 1) + '</div>');
		if (setup.status) {
			$setup.append('<div class="setup-status">' + setup.status + '</div>');
		}
		if (setup.status === 'Assigned') {
			var match = matchDict[setup.matchId];
			if (match) {
				var player1 = playerDict[match.player1_id];
				var player2 = playerDict[match.player2_id];
				$setup.append('<div>' + player1 + ' vs ' + player2 + '</div>');
			}
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

	$('#save-challonge-url').click(function() {
		var url = $('#challonge-url').val();
		tournamentSocket.emit('save challonge url', url);
	});

	$('#add-setup').click(function() {
		tournamentSocket.emit('add setup');
	});

	challongeSocket.on('request room', function() {
		var challongeUrl = $('#challonge-url').val();
		if (challongeUrl !== '') {
			challongeSocket.emit('join room', challongeUrl);
		}
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
	});

	tournamentSocket.on('request room', function() {
		var room = getLastPartOfUrl();
		tournamentSocket.emit('join room', room);
	});

	tournamentSocket.on('tournament info', function(info) {
		var $setupsList;
		var $challongeUrl;
		var availableMatchList;
		if (!info) {
			return;
		}
		if (info.challongeUrl && info.challongeUrl !== '') {
			$challongeUrl = $('#challonge-url');
			if ($challongeUrl.val() !== info.challongeUrl) {
				$challongeUrl.val(info.challongeUrl);
				challongeSocket.emit('join room', info.challongeUrl);
			}
		}
		setups = info.setups;
		updateSetupsList(setups);

		availableMatchList = getAvailableMatches(matchList);
		updateMatchList(availableMatchList, playerDict);
		$('.available-match-count').text(availableMatchList.length);
	});
});
