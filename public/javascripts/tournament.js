var tournamentSocket = io('/tournament');
var challongeSocket = io('/challonge');
var setups = [];

function getLastPartOfUrl() {
	var partArray = window.location.href.split('/');
	var lastPart = '';
	while (lastPart === '' && partArray.length > 0) {
		lastPart = partArray.pop();
	}
	return lastPart;
}

function getAvailableMatches(challongeInfo) {
    var availableMatches = [];
    challongeInfo.matches.forEach(function(match) {
        if (match.match.state === 'open') {
            availableMatches.push(match);
        }
    });
    return availableMatches;
}

function getPlayerDictionary(challongeInfo) {
    var playerDict = {};

    challongeInfo.participants.forEach(function(player) {
        playerDict[player.participant.id] = player.participant.name || player.participant.username;
    });

    return playerDict;
}

function buildSetupSelector(setupList) {
	var $selector = $('<select class="setup-selector"><option value="" disabled selected style="display:none;"></option></select>');
	for (var i = 0; i < setupList.length; i++) {
		if (!setupList[i].status) {
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

$(function() {
	$(document).on('change', '.setup-selector', function() {
		var setup = $(this).val();

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
		tournamentSocket.emit('join room', challongeUrl);
	});

	challongeSocket.on('tournament info', function(info) {
		var availableMatches = getAvailableMatches(info);
		var players = getPlayerDictionary(info);

		updateMatchList(availableMatches, players);
		$('.available-match-count').text(availableMatches.length);
	});

	tournamentSocket.on('request room', function() {
		var room = getLastPartOfUrl();
		tournamentSocket.emit('join room', room);
	});

	tournamentSocket.on('tournament info', function(info) {
		var $setupsList;
		var $challongeUrl;
		if (!info) {
			return;
		}
		if (info.challongeUrl) {
			$challongeUrl = $('#challonge-url');
			if ($challongeUrl.val() !== info.challongeUrl) {
				$challongeUrl.val(info.challongeUrl);
				challongeSocket.emit('join room', info.challongeUrl);
			}
		}
		$setupsList = $('#setups-list');
		$setupsList.empty();
		if (info.setups) {
			setups = info.setups;
			for (var i = 0; i < info.setups.length; i++) {
				var setup = info.setups[i];
				var $setup = $('<li></li>');
				$setup.append('<div class="setup-id">' + (i + 1) + '</div>');
				if (!setup.status) {
					$setup.append('<div class="available-matches"></div>');
				}
				$setupsList.append($setup);
			}
		}
	});
});
