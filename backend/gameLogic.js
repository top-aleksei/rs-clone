module.exports.nextActivePlayer = function (game) {
  if (this.activePlayersCount(game) === 0) {
    return;
  }
  game.activePlayerNumber =
    game.activePlayerNumber + 1 < game.players.length
      ? game.activePlayerNumber + 1
      : 0;
  game.activePlayer = game.nicknames[game.activePlayerNumber];
  const player = game.players.filter(
    (player) => player.nickname === game.activePlayer
  )[0];
  if (!player.active) this.nextActivePlayer(game);
};

module.exports.activePlayersCount = function (game) {
  return game.players.filter((player) => player.active == true).length;
};

module.exports.isGameOver = function (game) {
  if (this.activePlayersCount(game) === 1) return true;
  return false;
};

module.exports.toDoBancrot = function (game, positions, nickname) {
  game.players = game.players.map((player) => {
    if (player.nickname === nickname) {
      player.active = false;
      player.owner = [];
    }
    return player;
  });
  for (key in positions) {
    if (positions[key].owner === nickname) {
      positions[key].owner = null;
    }
  }
};

module.exports.getWinner = function (game) {
  return game.players.filter((player) => player.active === true)[0].nickname;
};
