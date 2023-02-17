const express = require('express');
const bodyParser = require('body-parser');
const Websocket = require('ws');
const cors = require('cors');
const morgan = require('morgan');

const games = {};
const players = new Set();
const colors = ['red', 'green', 'blue', 'yellow'];

const app = express();
const port = 13500;

const positions = {
  1: {},
  2: {
    type: 'build',
    name: 'galanteya',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  3: {},
  4: {
    type: 'build',
    name: 'makey',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  5: {},
  6: {
    type: 'build',
    name: 'belshina',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  7: {
    type: 'build',
    name: 'milavitsa',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  8: {},
  9: {
    type: 'build',
    name: 'markformelle',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  10: {
    type: 'build',
    name: 'svitanak',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  11: {},
  12: {
    type: 'build',
    name: 'kommunarka',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  13: {
    type: 'build',
    name: 'horizont',
    owner: null,
    costBuy: 1000,
    costSell: 500,
  },
  14: {
    type: 'build',
    name: 'spartak',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  15: {
    type: 'build',
    name: 'krasnyi',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  16: {
    type: 'build',
    name: 'maz',
    owner: null,
    costBuy: 1000,
    costSell: 500,
  },
  17: {
    type: 'build',
    name: 'lidskaye',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  18: {},
  19: {
    type: 'build',
    name: 'alivarya',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  20: {
    type: 'build',
    name: 'kristall',
    owner: null,
    costBuy: 1000,
    costSell: 500,
  },
  21: {},
  22: {
    type: 'build',
    name: 'belita',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  23: {},
  24: {
    type: 'build',
    name: 'relodis',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  25: {
    type: 'build',
    name: 'luxvisage',
    owner: null,
    costBuy: 1000,
    costSell: 500,
  },
  26: {
    type: 'build',
    name: 'belaz',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  27: {
    type: 'build',
    name: 'aist',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  28: {
    type: 'build',
    name: 'krakken',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  29: {
    type: 'build',
    name: 'atlant',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  30: {
    type: 'build',
    name: 'minsk',
    owner: null,
    costBuy: 1000,
    costSell: 500,
  },
  31: {},
  32: {
    type: 'build',
    name: 'shagovita',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  33: {
    type: 'build',
    name: 'belwest',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  34: {},
  35: {
    type: 'build',
    name: 'marko',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  36: {
    type: 'build',
    name: 'belarus',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  37: {},
  38: {
    type: 'build',
    name: 'bmz',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
  39: {},
  40: {
    type: 'build',
    name: 'belaruskali',
    owner: null,
    costBuy: 1000,
    costSell: 500,
    costParking: 1000,
  },
};

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
      //games[req.gameId].canPlay = false;
      games[req.payload.gameId].gameId = req.payload.gameId;
      games[req.payload.gameId].players = [ws];
      games[req.payload.gameId].nicknames = req.payload.nicknames;
      //games[gameId].activePlayer = null;
      games[req.payload.gameId].qty = req.payload.qty;
      ws.nickname = req.payload.nicknames[0];
      ws.gameId = req.payload.gameId;
      //console.log(ws.nickname);
      /*ws.position = 1; //TODO: поставить позицию какую надо
    ws.money = 1000; //TODO: поставить денег сколько надо
    ws.owner = []; //TODO:это будет тут храниться чем владеет
    */
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
      case 'end':
        if (req.payload.id === games[gameId].whoGo) {
          games[gameId].action = 'startGo';
          games[gameId].activePlayer += 1;
          games[gameId].activePlayer =
            games[gameId].activePlayer === games[gameId].players.length
              ? 0
              : games[gameId].activePlayer;
          games[gameId].whoGo =
            games[gameId].players[games[gameId].activePlayer].id;
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
        break;*/
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
  switch (req.event) {
    case 'step':
      req.payload.boneOne = Math.floor(Math.random() * 6) + 1;
      req.payload.boneTwo = Math.floor(Math.random() * 6) + 1;
      games[req.payload.gameId].players[
        games[req.payload.gameId].activePlayerNumber
      ].position =
        games[req.payload.gameId].players[
          games[req.payload.gameId].activePlayerNumber
        ].position +
        req.payload.boneOne +
        req.payload.boneTwo;
      if (
        games[req.payload.gameId].players[
          games[req.payload.gameId].activePlayerNumber
        ].position > 40
      )
        games[req.payload.gameId].players[
          games[req.payload.gameId].activePlayerNumber
        ].position -= 40;

      // если позиция на здании
      if (
        games[req.payload.gameId].positions[
          games[req.payload.gameId].players[
            games[req.payload.gameId].activePlayerNumber
          ].position
        ].hasOwnProperty('owner') &&
        games[req.payload.gameId].positions[
          games[req.payload.gameId].players[
            games[req.payload.gameId].activePlayerNumber
          ].position
        ].owner === null
      ) {
        games[req.payload.gameId].type = 'abilityToByu';
        req.payload.buildName =
          games[req.payload.gameId].positions[
            games[req.payload.gameId].players[
              games[req.payload.gameId].activePlayerNumber
            ].position
          ].name;
        req.payload.buildCost =
          games[req.payload.gameId].positions[
            games[req.payload.gameId].players[
              games[req.payload.gameId].activePlayerNumber
            ].position
          ].costBuy;
      }
      // остальное
      else {
        games[req.payload.gameId].type = 'next';
      }

      break;

    case 'stepend':
      if (req.payload.nickname === games[req.payload.gameId].activePlayer) {
        games[req.payload.gameId].activePlayerNumber =
          games[req.payload.gameId].activePlayerNumber + 1 <
          games[req.payload.gameId].players.length
            ? games[req.payload.gameId].activePlayerNumber + 1
            : 0;
        games[req.payload.gameId].activePlayer =
          games[req.payload.gameId].nicknames[
            games[req.payload.gameId].activePlayerNumber
          ];
        games[req.payload.gameId].type = 'step';
      }
      break;

    case 'chatMessage': {
      const actualPlayer = games[req.payload.gameId].players.filter(
        (player) => player.nickname === req.payload.nickname
      )[0];
      req.payload.color = actualPlayer.color;
    }
  }
}

start();
