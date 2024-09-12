const http = require('http');
// const WebSocket = require('ws');

// const hostname = 'pre.bootcamp.tk.sg';
// const port = 9002;

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


const main = async () => {
  const playerKey = 716811849;
  var playerId;
  var gameId;
  var factoryPosition;
  var factoryId;
  const miningBots = [];
  try{   
    // Fetch game information
    let response = await sendRequest('/games', 'GET', {});
    const games = response;
    console.log('Games:', games);
  } catch (error) {
    console.error('Error in main:', error);
  }
};

main();