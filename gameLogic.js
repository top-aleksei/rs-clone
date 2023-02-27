module.exports.nextActivePlayer = function (game) {
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
