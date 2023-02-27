module.exports.nextActivePlayer = function (game) {
  if (this.activePlayersCount(game) === 0) {
    //TODO: удалить игру
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
  return game.players.filter((player) => player.active).length;
};

module.exports.isGameOver = function (game) {
  if (this.activePlayersCount(game) === 1) return true;
  return false;
};
