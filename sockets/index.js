module.exports = function(io) {
  require('./twitch')(io);
  require('./challonge')(io);
  require('./tournament')(io);
};
