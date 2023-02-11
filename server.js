const express = require('express');
const bodyParser = require('body-parser');
const Websocket = require('ws');
const cors = require('cors');
const morgan = require('morgan');

const games = {};

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
    const rooms = {
      event: 'rooms',
      games: games,
    };
    wsClient.send(JSON.stringify(rooms));

    wsClient.on('message', async (message) => {
      const req = JSON.parse(message.toString());
      console.log(req);
      if (req.event == 'create') {
        //wsClient.id = req.payload.id;
        wsClient.nickname = req.payload.players[0];
        wsClient.position = 1; //TODO: поставить посицию какую надо
        wsClient.money = 1000; //TODO: поставить денег сколько надо
        wsClient.owner = []; //TODO:это будет тут храниться чем владеет
      }
      initGames(wsClient, req.payload.qty, req.payload.gameId);
      broadcast(req);
    });
  });
}

function initGames(ws, qty, gameId) {
  if (!games[gameId]) {
    games[gameId] = {};
    games[gameId].canPlay = false;
    games[gameId].players = [ws];
    games[gameId].activePlayer = null;
  } else if (games[gameId] && games[gameId].players?.length < qty) {
    games[gameId].players = games[gameId].players.filter(
      (player) => player.nickname !== ws.nickname
    );
    games[gameId].players = [...games[gameId].players, ws];
  } else if (games[gameId] && games[gameId].players?.length === qty) {
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
}

function broadcast(req) {
  let res;
  const { id, name, gameId } = req.payload;
  games[gameId].players.forEach((client) => {
    switch (req.event) {
      case 'connect': {
        res = JSON.stringify(games);
      }
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
        break;
      default:
        res = {
          event: 'unknown',
        };
        break;
    }
    client.send(JSON.stringify(res));
  });
}

start();
