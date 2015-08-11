var socket = io('/tournament');

function getLastPartOfUrl() {
	var partArray = window.location.href.split('/');
	var lastPart = '';
	while (lastPart === '' && partArray.length > 0) {
		lastPart = partArray.pop();
	}
	return lastPart;
}

$(function() {
	$('#save-challonge-url').click(function() {
		var url = $('#challonge-url').val();
		socket.emit('save challonge url', url);
	});

	$('#add-setup').click(function() {
		socket.emit('add setup');
	});

	socket.on('request room', function() {
		var room = getLastPartOfUrl();
		socket.emit('join room', room);
	});

	socket.on('tournament info', function(info) {
		if (!info) {
			return;
		}
		if (info.challongeUrl) {
			$('#challonge-url').val(info.challongeUrl);
		}
		var $setupsList = $('#setups-list');
		$setupsList.empty();
		if (info.setups) {
			for (var i = 0; i < info.setups.length; i++) {
				$setupsList.append('<li>' + (i + 1) + '</li>');
			}
		}
	});
});
