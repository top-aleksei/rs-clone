const express = require('express');
const bodyParser = require('body-parser');
const Websocket = require('ws');
const cors = require('cors');
const morgan = require('morgan');

const positions = require('./positions.js');

const games = {};
const players = new Set();
const colors = ['red', 'green', 'blue', 'yellow'];

const app = express();
const port = 13500;

app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routes = require('./settings/routes');
routes(app);
app.listen(port, () => {
  console.log(`App listen on port ${port}`);
});

function start() {
  const wss = new Websocket.Server({ port: 14000 }, () =>
    console.log('Websocket Server start on port 14000')
  );

  wss.on('connection', (wsClient) => {
    // Отправляю комнаты которые есть
    players.add(wsClient);
    const gamesNow = [];
    for (var key in games) {
      let game = {
        gameId: key,
        qty: games[key].qty,
        nicknames: games[key].nicknames,
      };
      gamesNow.push(game);
    }

    const rooms = {
      event: 'rooms',
      games: gamesNow,
    };
    console.log(`send to new client :`, JSON.stringify(rooms));
    wsClient.send(JSON.stringify(rooms));

    wsClient.on('message', async (message) => {
      const req = JSON.parse(message.toString());
      console.log(`Coming message: ${JSON.stringify(req)}`);

      if (
        req.event === 'create' ||
        req.event === 'join' ||
        req.event === 'leave'
      ) {
        initGames(wsClient, req);
        multicast(req);
      } else {
        logic(req);
        broadcast(req);
      }
    });

    wsClient.on('close', async () => {
      if (wsClient.gameId) {
        games[wsClient.gameId].players = games[wsClient.gameId].players.filter(
          (player) => player !== wsClient
        );
        games[wsClient.gameId].nicknames = games[
          wsClient.gameId
        ].nicknames.filter((nickname) => nickname !== wsClient.nickname);

        const req = {
          event: 'leave',
          payload: {
            gameId: wsClient.gameId,
            qty: games[wsClient.gameId].qty,
            nicknames: games[wsClient.gameId].nicknames,
          },
        };
        initGames(wsClient, req);
        multicast(req);
      }
      players.delete(wsClient);
    });
  });
}

function initGames(ws, req) {
  if (req.event === 'create') {
    if (!games[req.payload.gameId]) {
      games[req.payload.gameId] = {};
      games[req.payload.gameId].gameId = req.payload.gameId;
      games[req.payload.gameId].players = [ws];
      games[req.payload.gameId].nicknames = req.payload.nicknames;
      games[req.payload.gameId].qty = req.payload.qty;
      ws.nickname = req.payload.nicknames[0];
      ws.gameId = req.payload.gameId;
    }
  } else if (req.event === 'join') {
    ws.nickname = req.payload.nickname;
    ws.gameId = req.payload.gameId;
    /*games[gameId].players = games[gameId].players.filter(
      (player) => player.nickname !== ws.nickname
    );*/
    games[req.payload.gameId].players = [
      ...games[req.payload.gameId].players,
      ws,
    ];
    games[req.payload.gameId].nicknames = games[req.payload.gameId].players.map(
      (player) => player.nickname
    );
  } else if (req.event === 'leave') {
    ws.nickname = req.payload.nickname;
    ws.gameId = null;
    games[req.payload.gameId].players = games[
      req.payload.gameId
    ].players.filter((player) => player.nickname !== ws.nickname);
    games[req.payload.gameId].nicknames = games[req.payload.gameId].players.map(
      (player) => player.nickname
    );
  }
} /*else if (games[gameId] && games[gameId].players?.length === qty) {
    games[gameId].players = games[gameId].players.filter(
      (player) => player.nickname !== ws.nickname
    );
    games[gameId].players = [...games[gameId].players, ws];
    if (games[gameId].players?.length === qty) {
      games[gameId].canPlay = true;
      games[gameId].action = 'startGo';
      games[gameId].activePlayer = 0;
      games[gameId].whoGo =
        games[gameId].players[games[gameId].activePlayer].id;
    }
  } else if (games[gameId] && games[gameId].players?.length > qty) {
    if (
      games[gameId].players.filter((player) => player.nickname !== ws.nickname)
        .length > 0
    ) {
      games[gameId].players = games[gameId].players.filter(
        (player) => player.nickname !== ws.nickname
      );
      games[gameId].players = [...games[gameId].players, ws];
      games[gameId].canPlay = true;
      games[gameId].action = 'startGo';
    } else ws.send('Room is full');
  }
}*/

function multicast(req) {
  let res;
  Array.from(players).forEach((client) => {
    switch (req.event) {
      case 'create':
        {
          res = {
            event: 'newroom',
            room: {
              gameId: req.payload.gameId,
              qty: games[req.payload.gameId].qty,
              nicknames: games[req.payload.gameId].nicknames,
            },
          };
        }
        break;
      case 'join':
      case 'leave':
        {
          res = {
            event: 'changeroom',
            room: {
              gameId: req.payload.gameId,
              qty: games[req.payload.gameId].qty,
              nicknames: games[req.payload.gameId].nicknames,
            },
          };
        }
        break;
      default:
        res = {
          event: 'unknown',
        };
        break;
    }
    console.log(`sending to ${client.nickname}:`, JSON.stringify(res));
    client.send(JSON.stringify(res));
  });

  //если в конате все игроки - начать игру (разослать броадкаст)
  if (
    games[req.payload.gameId].players.length === games[req.payload.gameId].qty
  ) {
    //задать все свойства плееру
    games[req.payload.gameId].players.map((player, index) => {
      player.position = 1;
      player.color = colors[index];
      player.money = 10000;
      player.owner = [];
    });
    //задать свойства для game
    games[req.payload.gameId].positions = JSON.parse(JSON.stringify(positions));
    games[req.payload.gameId].activePlayerNumber = 0;
    games[req.payload.gameId].activePlayer =
      games[req.payload.gameId].nicknames[
        games[req.payload.gameId].activePlayerNumber
      ];
    games[req.payload.gameId].type = 'step';
    const reqToStart = {
      event: 'startGame',
      payload: {
        gameId: req.payload.gameId,
      },
    };
    broadcast(reqToStart);
  }

  //если все вышли из комнаты - удалить комнату
  if (games[req.payload.gameId].players.length === 0) {
    delete games[req.payload.gameId];
  }
}

function broadcast(req) {
  let res;
  games[req.payload.gameId].players.forEach((client) => {
    switch (req.event) {
      case 'startGame':
        {
          res = {
            event: 'startGame',
            payload: {
              gameId: req.payload.gameId,
              activePlayer: games[req.payload.gameId].activePlayer,
              type: games[req.payload.gameId].type,
              players: games[req.payload.gameId].players.map((player) => {
                return {
                  nickname: player.nickname,
                  position: player.position,
                  color: player.color,
                  money: player.money,
                  owner: player.owner,
                };
              }),
            },
          };
        }
        break;

      case 'stepend':
        {
          res = {
            event: 'startStep',
            payload: {
              gameId: req.payload.gameId,
              activePlayer: games[req.payload.gameId].activePlayer,
              type: games[req.payload.gameId].type,
              players: games[req.payload.gameId].players.map((player) => {
                return {
                  nickname: player.nickname,
                  position: player.position,
                  color: player.color,
                  money: player.money,
                  owner: player.owner,
                };
              }),
            },
          };
        }
        break;

      case 'step':
        {
          res = {
            event: 'stepping',
            payload: {
              gameId: req.payload.gameId,
              activePlayer: games[req.payload.gameId].activePlayer,
              type: games[req.payload.gameId].type,
              players: games[req.payload.gameId].players.map((player) => {
                return {
                  nickname: player.nickname,
                  position: player.position,
                  color: player.color,
                  money: player.money,
                  owner: player.owner,
                };
              }),
              boneOne: req.payload.boneOne,
              boneTwo: req.payload.boneTwo,
            },
          };
          if (games[req.payload.gameId].type === 'abilityToByu') {
            res.payload.buildName = req.payload.buildName;
            res.payload.buildCost = req.payload.buildCost;
          }
          if (games[req.payload.gameId].type === 'payingTax') {
            res.payload.buildName = req.payload.buildName;
            res.payload.ownerName = req.payload.ownerName;
            res.payload.costParking = req.payload.costParking;
          }
          if (games[req.payload.gameId].type === 'bonus') {
            res.payload.bonusSize = req.payload.bonusSize;
          }

          /* if (games[req.payload.gameId].type === 'buying') {
            res.payload.byuing = req.payload.buildName;
          }*/
        }
        break;

      case 'paying':
        {
          res = {
            event: 'paying',
            payload: {
              gameId: req.payload.gameId,
              activePlayer: games[req.payload.gameId].activePlayer,
              type: games[req.payload.gameId].type,
              buildName: req.payload.buildName,
              ownerName: req.payload.ownerName,
              costParking: req.payload.costParking,
              players: games[req.payload.gameId].players.map((player) => {
                return {
                  nickname: player.nickname,
                  position: player.position,
                  color: player.color,
                  money: player.money,
                  owner: player.owner,
                };
              }),
            },
          };
        }
        break;

      case 'buying':
        {
          res = {
            event: 'stepping',
            payload: {
              gameId: req.payload.gameId,
              activePlayer: games[req.payload.gameId].activePlayer,
              type: games[req.payload.gameId].type,
              buying: req.payload.buildName,
              players: games[req.payload.gameId].players.map((player) => {
                return {
                  nickname: player.nickname,
                  position: player.position,
                  color: player.color,
                  money: player.money,
                  owner: player.owner,
                };
              }),
            },
          };
        }
        break;

      case 'selling':
        {
          res = {
            event: 'selling',
            payload: {
              gameId: req.payload.gameId,
              activePlayer: games[req.payload.gameId].activePlayer,
              type: games[req.payload.gameId].type,
              selling: req.payload.buildName,
              cost: req.payload.cost,
              players: games[req.payload.gameId].players.map((player) => {
                return {
                  nickname: player.nickname,
                  position: player.position,
                  color: player.color,
                  money: player.money,
                  owner: player.owner,
                };
              }),
            },
          };
        }
        break;

      case 'chatMessage':
        {
          res = {
            event: 'chatMessage',
            payload: {
              gameId: req.payload.gameId,
              nickname: req.payload.nickname,
              message: req.payload.message,
              color: req.payload.color,
            },
          };
        }
        break;
      /*case 'join':
        res = {
          event: 'connectToPlay',
          payload: {
            gameId: gameId,
            success: true,
            players: games[gameId].players.map((client) => {
              return {
                playerId: client.id,
                playerName: client.nickname,
                playerPosition: client.position,
                playerMoney: client.money,
                playerOwner: client.owner,
              };
            }),
            canPlay: games[gameId].canPlay,
            whoGo: games[gameId].whoGo,
            action: games[gameId].action,
          },
        };
        break;
        case 'going':
        if (req.payload.id === games[gameId].whoGo) {
          games[gameId].action = 'finishGo';
          if (client.id === games[gameId].whoGo) client.position += 1;
          res = {
            event: 'going',
            payload: {
              gameId: gameId,
              success: true,
              players: games[gameId].players.map((client) => {
                return {
                  playerId: client.id,
                  playerName: client.nickname,
                  playerPosition: client.position,
                  playerMoney: client.money,
                  playerOwner: client.owner,
                };
              }),
              canPlay: games[gameId].canPlay,
              whoGo: games[gameId].whoGo,
              action: games[gameId].action,
            },
          };
        }

        break;
*/
      default:
        res = {
          event: 'unknown',
        };
        break;
    }
    console.log(`sending to: ${client.nickname}:`, JSON.stringify(res));
    client.send(JSON.stringify(res));
  });
}

function logic(req) {
  const gameId = req.payload.gameId;
  const game = games[gameId];
  const currentPlayerNumber = game.activePlayerNumber;
  const currentPlayer = game.players[currentPlayerNumber];
  const currentPosition = game.positions[currentPlayer.position];

  switch (req.event) {
    case 'step':
      req.payload.boneOne = Math.floor(Math.random() * 6) + 1;
      req.payload.boneTwo = Math.floor(Math.random() * 6) + 1;

      currentPlayer.position =
        currentPlayer.position + req.payload.boneOne + req.payload.boneTwo;
      if (currentPlayer.position > 40) currentPlayer.position -= 40;

      // если позиция на здании и свободна
      if (
        currentPosition.hasOwnProperty('owner') &&
        currentPosition.owner === null
      ) {
        game.type = 'abilityToByu';
        req.payload.buildName = currentPosition.name;
        req.payload.buildCost = currentPosition.costBuy;
      }

      //если позиция на здании и не свободна
      else if (
        currentPosition.hasOwnProperty('owner') &&
        currentPosition.owner !== null
      ) {
        const ownerName = currentPosition.owner;

        const nickname = req.payload.nickname;

        game.type = 'payingTax';
        req.payload.ownerName = ownerName;
        req.payload.costParking = currentPosition.costParking;
      }

      //если позиция бонусная
      else if (currentPosition.type === 'bonus') {
        game.type = 'bonus';
        let bonusMinus = Math.round(Math.random());
        let bonusSize = Math.floor(Math.random() * 10 + 1) * 100;
        if (currentPosition.sign === 'minus') {
          bonusSize = -bonusSize;
        } else if (currentPosition.sign !== 'plus' && bonusMinus) {
          bonusSize = -bonusSize;
        }
        game.type = 'bonus';
        req.payload.bonusSize = bonusSize;
        //добавить бонус игроку
        currentPlayer.money += bonusSize;
      }
      // остальное
      else {
        game.type = 'next';
      }
      break;

    case 'buying':
      if (req.payload.nickname === game.activePlayer) {
        currentPlayer.money = currentPlayer.money - currentPosition.costBuy;
        currentPosition.owner = game.activePlayer;
        currentPlayer.owner.push(req.payload.buildName);
      }
      game.type = 'buying';

      break;

    case 'selling':
      //продающееся здание
      const sellingBuilding = null;
      for (keys in positions) {
        if (positions[keys].name === req.payload.buildName) {
          sellingBuilding = positions[keys].name;
        }
      }
      // продающий игрок
      currentPlayer.money += sellingBuilding.costSell;
      currentPlayer.owner.delete(sellingBuilding.name);
      sellingBuilding.owner = null;
      game.type = 'selling';
      req.payload.cost = sellingBuilding.costSell;
      break;

    case 'paying': {
      const ownerName = currentPosition.owner;

      const nickname = req.payload.nickname;

      //оплата
      game.players = game.players.map((player) => {
        if (player.nickname === nickname) {
          player.money -= currentPosition.costParking;
        } else if (player.nickname === ownerName) {
          player.money += currentPosition.costParking;
        }
        return player;
      });

      game.type = 'paidTax';
      req.payload.ownerName = ownerName;
      req.payload.costParking = currentPosition.costParking;
    }

    case 'stepend':
      if (req.payload.nickname === game.activePlayer) {
        game.activePlayerNumber =
          game.activePlayerNumber + 1 < game.players.length
            ? game.activePlayerNumber + 1
            : 0;
        game.activePlayer = game.nicknames[game.activePlayerNumber];
        game.type = 'step';
      }
      break;

    case 'chatMessage': {
      const actualPlayer = game.players.filter(
        (player) => player.nickname === req.payload.nickname
      )[0];
      req.payload.color = actualPlayer.color;
    }
  }
}

start();
