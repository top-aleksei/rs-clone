const express = require('express');
const bodyParser = require('body-parser');
const Websocket = require('ws');

const games = {};

const app = express();
const port = 13500;

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
    wsClient.on('message', async (message) => {
      const req = JSON.parse(message.toString());
      console.log(req);
      if (req.event == 'connect') {
        wsClient.id = req.payload.id;
        wsClient.nickname = req.payload.name;
        initGames(wsClient, req.payload.gameId);
      }

      broadcast(req);
    });
  });
}

function initGames(ws, gameId) {
  if (!games[gameId]) {
    games[gameId] = {};
    games[gameId].canPlay = false;
    games[gameId].players = [ws];
    let activePlayer = null;
  } else if (games[gameId] && games[gameId].players?.length < 2) {
    games[gameId].players = games[gameId].players.filter(
      (player) => player.nickname !== ws.nickname
    );
    games[gameId].players = [...games[gameId].players, ws];
  } else if (games[gameId] && games[gameId].players?.length === 2) {
    games[gameId].players = games[gameId].players.filter(
      (player) => player.nickname !== ws.nickname
    );
    games[gameId].players = [...games[gameId].players, ws];
    if (games[gameId].players?.length === 3) {
      games[gameId].canPlay = true;
      games[gameId].action = 'startGo';
      activePlayer = 0;
      games[gameId].whoGo = games[gameId].players[0].id;
    }
  } else if (games[gameId] && games[gameId].players?.length > 2) {
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
      case 'connect':
        res = {
          event: 'connectToPlay',
          payload: {
            gameId: gameId,
            success: true,
            players: games[gameId].players.map((client) => client.nickname),
            canPlay: games[gameId].canPlay,
            whoGo: games[gameId].whoGo,
            action: games[gameId].action,
          },
        };
        break;
      case 'going':
        if (req.payload.id === games[gameId].whoGo) {
          games[gameId].action = 'finishGo';
          //TODO: добавить очки количество ходов игроку
          res = {
            event: 'going',
            payload: {
              gameId: gameId,
              success: true,
              players: games[gameId].players.map((client) => client.nickname),
              canPlay: games[gameId].canPlay,
              whoGo: games[gameId].whoGo,
              action: games[gameId].action,
            },
          };
        } else {
          res = {
            event: 'error',
            message: 'Dont your move',
          };
        }
        break;
      case 'end':
        if (req.payload.id === games[gameId].whoGo) {
          games[gameId].action = 'startGo';
          activePlayer += 1;
          activePlayer =
            activePlayer > games[gameId].players.length ? 0 : activePlayer;
          games[gameId].whoGo = games[gameId].players[activePlayer].id;
          res = {
            event: 'going',
            payload: {
              gameId: gameId,
              success: true,
              players: games[gameId].players.map((client) => client.nickname),
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
