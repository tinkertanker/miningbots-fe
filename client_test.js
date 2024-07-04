const http = require('http');
const WebSocket = require('ws');

const hostname = 'pre.bootcamp.tk.sg';
const port = 9002;

const playerKey = 716811849;
let playerId = 123123123;
let gameId = 1347569398;
let factoryPosition;
let factoryId;

const sendRequest = (path, method, params) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      port: port,
      path: `${path}?${new URLSearchParams(params).toString()}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
};

const subscribeClient = (ws) => {
  const subscribeRequest = {
    game_id: gameId,
    player_key: playerKey,
    player_id: playerId,
  };
  ws.send(JSON.stringify(subscribeRequest));
};

const handleMessage = (ws, message) => {
  const msg = JSON.parse(message);

  if (msg.upd) {
    const botUpdates = msg.upd.bot_updates;

    if (botUpdates && botUpdates.length > 0) {
      botUpdates.forEach((bot) => {
        if (bot.variant === 'kFactoryBot') {
          factoryPosition = bot.position;
          factoryId = bot.id;
        } else if (bot.variant === 'kMiningBot') {
          performMove(ws, bot.id);
        }
      });
    }
  } else if (msg.err) {
    console.error('Error:', msg.err);
  }
};

const performMove = async (ws, botId) => {
  const moveRequest = {
    game_id: gameId,
    player_id: playerId,
    key: playerKey,
    bot_id: botId,
    position: { x: 3, y: 7 }
  };
  try {
    const response = await sendRequest('/move', 'POST', { request: JSON.stringify(moveRequest) });
    console.log('Move response:', response);
    performMine(ws, botId);
  } catch (error) {
    console.error('Move error:', error);
  }
};

const performMine = async (ws, botId) => {
  const mineRequest = {
    game_id: gameId,
    player_id: playerId,
    key: playerKey,
    bot_id: botId,
    position: { x: 3, y: 7 },
    resource: { id: 1, amount: 200 }
  };
  try {
    const response = await sendRequest('/mine', 'POST', { request: JSON.stringify(mineRequest) });
    console.log('Mine response:', response);
    buildBot(ws);
  } catch (error) {
    console.error('Mine error:', error);
  }
};

const buildBot = async (ws) => {
  const buildBotRequest = {
    game_id: gameId,
    player_id: playerId,
    key: playerKey,
    factory_id: factoryId
  };
  try {
    const response = await sendRequest('/build_bot', 'POST', { request: JSON.stringify(buildBotRequest) });
    console.log('Build bot response:', response);
  } catch (error) {
    console.error('Build bot error:', error);
  }
};

const main = async () => {
  try {
    // Fetch game information
    let response = await sendRequest('/games', 'GET', {});
    const games = response;
    console.log('Games:', games);

    gameId = games.find(game => game.game_status === 'kNotStarted' || game.game_status === 'kOpen').game_id;
    console.log('Found game ID:', gameId);

    // Join the game
    const joinGameRequest = {
      game_id: gameId,
      player_name: "Simulated Player",
      key: playerKey
    };
    response = await sendRequest('/join_game', 'PUT', { request: JSON.stringify(joinGameRequest) });
    playerId = response;
    console.log('Joined game with player ID:', playerId);

    // Connect to WebSocket
    const ws = new WebSocket(`ws://${hostname}:${port}/update`);

    ws.on('open', () => {
      console.log('Connected to WebSocket');
      subscribeClient(ws);
    });

    ws.on('message', (message) => {
      handleMessage(ws, message);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  } catch (error) {
    console.error('Error in main:', error);
  }
};

main();
