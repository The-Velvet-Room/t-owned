var socket = io('/tournament');

$(function() {

    socket.on('tournament list', function(tournaments) {
        var tournamentNames = Object.keys(tournaments);
        for (var i = 0; i < tournamentNames.length; i++) {
            $('#tournament-list').append('<li class="tournament">' + tournamentNames[i] + '</li>');
        }
        $('#tournament-list');
    });


    $('#add-tournament').click(function() {
        var value = $('#new-tournament-name').val();
        socket.emit('tournament add', value);
        $('#new-tournament-name').val('');
    });
});
