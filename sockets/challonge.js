var challongeService = require('../services/challonge');

module.exports = function(io) {
    var challongeIO = io.of('/challonge');

    challongeIO.on('connection', function(socket) {
        // Log the new connection
        console.log('challonge user connected: ' + socket.handshake.address + ' -> ' + socket.request.headers.referer);

        challongeIO.to(socket.id).emit('request room');

        socket.on('join room', function(room) {
            console.log('Joining challonge room: ' + room);
            if (socket.rooms.length > 2) {
                console.error('Challonge socket is in multiple rooms: ' + socket.rooms);
            }
            socket.join(room, function() {
                challongeService.getTournament(room, function(info) {
                    challongeIO.to(socket.id).emit('tournament info', info);
                });
            });
        });

        socket.on('request tournament info', function() {
            var tournament = socket.rooms[socket.rooms.length - 1];
            console.log('Requesting tournament for ' + tournament);
            challongeService.getTournament(tournament, function(info) {
                challongeIO.to(tournament).emit('tournament info', info);
            });
        });

        socket.on('disconnect', function() {
            console.log('challonge user disconnected: ' + socket.handshake.address);
        });
    });
};
