const express = require('express');
const bodyParser = require('body-parser');
const Websocket = require('ws');
const cors = require('cors');
const morgan = require('morgan');

const games = {};
const players = new Set();

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
        id: key,
        qty: games[key].qty,
        nicknames: games[key].nicknames,
      };
      gamesNow.push(game);
    }

    const rooms = {
      event: 'rooms',
      games: gamesNow,
    };
    wsClient.send(JSON.stringify(rooms));

    wsClient.on('message', async (message) => {
      const req = JSON.parse(message.toString());
      console.log(req);

      if (
        req.event === 'create' ||
        req.event === 'join' ||
        req.event === 'leave'
      ) {
        initGames(wsClient, req);
        multicast(req);
      } else broadcast(req);
    });

    wsClient.on('close', async () => {
      players.delete(wsClient);
      for (var key in games) {
        // TODO: удалить со всех комнат
      }
    });
  });
}

function initGames(ws, req) {
  if (req.event === 'create') {
    if (!games[req.payload.gameId]) {
      games[req.payload.gameId] = {};
      //games[req.gameId].canPlay = false;
      games[req.payload.gameId].players = [ws];
      games[req.payload.gameId].nicknames = req.payload.nicknames;
      //games[gameId].activePlayer = null;
      games[req.payload.gameId].qty = req.payload.qty;
      ws.nickname = req.payload.nicknames;
      /*ws.position = 1; //TODO: поставить позицию какую надо
    ws.money = 1000; //TODO: поставить денег сколько надо
    ws.owner = []; //TODO:это будет тут храниться чем владеет
    */
    }
  } else if (req.event === 'join') {
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
    games[req.payload.gameId].players = games[
      req.payload.gameId
    ].players.filter((player) => player.nickname !== ws.nickname);
    games[req.payload.gameId].nicknames = games[gameId].players.map(
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
      case ('join', 'leave'):
        {
          res = {
            event: 'changeroom',
            room: {
              gameId: req.payload.gameId,
              qty: games[req.payload.gameId].qty,
              nicknames: games[req.payload.gameId].nicknames,
            },
          };
          if (games[req.payload.gameId].players.length === 0) {
            res = {
              event: 'deleteroom',
              room: {
                gameId: req.payload.gameId,
                qty: games[req.payload.gameId].qty,
                nicknames: games[req.payload.gameId].nicknames,
              },
            };
            delete games[req.payload.gameId];
          }
        }
        break;
      default:
        res = {
          event: 'unknown',
        };
        break;
    }
    console.log('sending:', JSON.stringify(res));
    client.send(JSON.stringify(res));
  });
}

function broadcast(req) {
  let res;
  const { id, name, gameId } = req.payload;
  games[gameId].players.forEach((client) => {
    switch (req.event) {
      case 'join':
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
      /*  case 'going':
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
    console.log('sending:', res);
    client.send(JSON.stringify(res));
  });
}

start();
