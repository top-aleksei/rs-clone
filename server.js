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
      games[gameId].whoGo = games[gameId].players[0];
      games[gameId].action = 'go';
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
      games[gameId].whoGo = games[gameId].players[0];
      games[gameId].action = 'go';
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
          },
        };
        break;
      case 'going':
        res = 'trying to go';
        break;
      default:
        res = {
          event: 'unknown',
        };
    }
    client.send(JSON.stringify(res));
  });
}

start();
