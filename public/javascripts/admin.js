var socket = io('/tournamentList');

$(function() {
    socket.on('tournament list', function(tournaments) {
        $('#tournament-list').empty();
        var tournamentNames = Object.keys(tournaments);
        for (var i = 0; i < tournamentNames.length; i++) {
            $('#tournament-list').append('<li class="tournament">' + tournamentNames[i] + '</li>');
        }
    });

    $('#add-tournament').click(function() {
        var value = $('#new-tournament-name').val();
        socket.emit('tournament add', value);
        $('#new-tournament-name').val('');
    });
});
