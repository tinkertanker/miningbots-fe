console.log("script started");

// Get hostname from cookie, otherwise leave as null
const server = document.cookie
  .split("; ")
  .find((row) => row.startsWith("lastServer="))
  ?.split("=")[1];

//Probably some default values for original testing:
//var hostname = "s3.bootcamp.tk.sg";
//var port = 443;
var hostname = "localhost";
var port = 9003;
// if (server !== null) hostname = server; 
var gameId;
var http_type = "http";
var ws_type = "ws";

//Dictionary of servers and respective names, urls
var servers = {
  "p1.bootcamp.tk.sg": {
    name: "Game 1",
    url: "p1.bootcamp.tk.sg",
  },
  "p2.bootcamp.tk.sg": {
    name: "Game 2",
    url: "p2.bootcamp.tk.sg",
  },
  "p3.bootcamp.tk.sg": {
    name: "Game 3",
    url: "p3.bootcamp.tk.sg",
  },
  "p4.bootcamp.tk.sg": {
    name: "Game 4",
    url: "p4.bootcamp.tk.sg",
  },
  "p5.bootcamp.tk.sg": {
    name: "Game 5",
    url: "p5.bootcamp.tk.sg",
  },
  "p6.bootcamp.tk.sg": {
    name: "Game 6",
    url: "p6.bootcamp.tk.sg",
  },
  "p7.bootcamp.tk.sg": {
    name: "Main Game",
    url: "p7.bootcamp.tk.sg",
  },
  "p8.bootcamp.tk.sg": {
    name: "Game 8",
    url: "p8.bootcamp.tk.sg",
  },
  "p9.bootcamp.tk.sg": {
    name: "Game 9",
    url: "p9.bootcamp.tk.sg",
  },
  "p10.bootcamp.tk.sg": {
    name: "Game 10",
    url: "p10.bootcamp.tk.sg",
  },
  "s1.bootcamp.tk.sg": {
    name: "Staging 1",
    url: "s1.bootcamp.tk.sg",
  },
  "s2.bootcamp.tk.sg": {
    name: "Staging 2",
    url: "s2.bootcamp.tk.sg",
  },
  "s3.bootcamp.tk.sg": {
    name: "Staging 3",
    url: "s3.bootcamp.tk.sg",
  },
  "s4.bootcamp.tk.sg": {
    name: "Staging 4",
    url: "s4.bootcamp.tk.sg",
  },
  "s5.bootcamp.tk.sg": {
    name: "Staging 5",
    url: "s5.bootcamp.tk.sg",
  },
  "s6.bootcamp.tk.sg": {
    name: "Staging 6",
    url: "s6.bootcamp.tk.sg",
  },
  "s7.bootcamp.tk.sg": {
    name: "Staging 7",
    url: "s7.bootcamp.tk.sg",
  },
  "s8.bootcamp.tk.sg": {
    name: "Staging 8",
    url: "s8.bootcamp.tk.sg",
  },
  "s9.bootcamp.tk.sg": {
    name: "Staging 9",
    url: "s9.bootcamp.tk.sg",
  },
  "s10.bootcamp.tk.sg": {
    name: "Staging 10",
    url: "s10.bootcamp.tk.sg",
  },
  "localhost": {
    name: "localhost",
    url: "localhost",
  },
};

// Variable to hold the selected server URL
let selectedServerUrl = null;

// Function to populate the dropdown menu
function populateDropdown() {
  let dropdownMenu = document.querySelector(".dropdown-menu");
  Object.keys(servers).forEach(function (key) {
    let server = servers[key];
    let menuItem = `<a class="dropdown-item" href="#" data-url="${server.url}">${server.name}</a>`;
    dropdownMenu.innerHTML += menuItem;
  });
}

// Event listener for dropdown item click
document.addEventListener("DOMContentLoaded", function () {
  populateDropdown();

  let dropdownItems = document.querySelectorAll(".dropdown-item");
  dropdownItems.forEach(function (item) {
    item.addEventListener("click", function (event) {
      event.preventDefault();
      selectedServerUrl = this.getAttribute("data-url");
      console.log(selectedServerUrl);
      let selectedServerName = this.textContent;
      document.getElementById("navbarDropdownMenuLink").textContent =
        selectedServerName;
      // Save to cookie first
      document.cookie = `lastServer=${selectedServerUrl}`;
      location.reload();
      // drawGame(selectedServerUrl, port);
    });
  });
});

// Player Name fetch code 
async function fetchPlayerNames(gameId, playerIds) {
    const url = `${http_type}://${hostname}:${port}/players`;
    const playerRequest = { game_id: gameId, player_ids: playerIds };
  
    try {
      const response = await fetch(`${url}?request=${encodeURIComponent(JSON.stringify(playerRequest))}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const playerUpdates = await response.json();
      return playerUpdates;
    } catch (error) {
      console.error('Failed to fetch player names:', error);
    }
  }

function drawGame(hostname, port) {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  //Maybe adjust this to dynamically adapt such that the whole canvas will be shown regardless of map aspect ratio?
  const GRID_SIZE = 32;
  const images = {
    kFactoryBot: new Image(),
    kMiningBot: new Image(),
    mixed_ore: new Image(),
    granite: new Image(),
    vibranium: new Image(),
    adamantite: new Image(),
    unobtanium: new Image()
};

//Assigns images
images.kFactoryBot.src = 'assets/Factory_Bot.png';
images.kMiningBot.src = 'assets/Mining_Bot.png';
images.mixed_ore.src = 'assets/Mixed_Ore.png';
images.granite.src = 'assets/Granite.png';
images.vibranium.src = 'assets/Vibranium.png';
images.adamantite.src = 'assets/Adamantite.png';
images.unobtanium.src = 'assets/Unobtanium.png';

//Likely connecting to the server and retrieving initial game state
fetch(`${http_type}://${hostname}:${port}/games`, {
    method: 'GET'
})
    .then(response => {
        // console.log(response);
        if (response.ok) {
            // console.log('games:', response);
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    })
    .then(games => {
        console.log('games:', games);
        let gameId = games[0].game_id;
        let gameStatus = games[0].game_status;
        if (gameStatus == 'kEnded') {
            console.log('failed to subscribe because game has ended');
            return;
        }
        let fetch_map_config = fetch(`${http_type}://${hostname}:${port}/map_config?game_id=${gameId}`, {
            method: 'GET'
        });

        return { response: fetch_map_config, game_id: gameId };
    })
    .then(async result => {
        let response = await result.response;

        if (response.ok) {
            console.log('Second fetch response:', response);
            return { map_config: response.json(), game_id: result.game_id };
        } else {
            throw new Error(response.statusText);
        }
    })
    //Map config taken from server data
    .then(async result => {
        let map_config = await result.map_config;
        console.log('map_config:', map_config);
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const COLS = map_config.max_x;
        const ROWS = map_config.max_y;
        const MAX_WHITE_WIDTH = 60;
        const MAX_WHITE_HEIGHT = 60;
        const borderWidth = 1;
        const GRID_SIZE = Math.min(screenWidth / COLS, screenHeight / ROWS);

        console.log(COLS);

        // Update canvas dimensions
        canvas.width = COLS * GRID_SIZE;
        canvas.height = ROWS * GRID_SIZE;
        let resource_configs = map_config.resource_configs;

        const elements = {
            kMiningBotOne: 0,
            kFactoryBotOne: 1,
            kMiningBotTwo: 2,
            kFactoryBotTwo: 3,
            unknown: 4,
            traversable: 5,
            resource: 6,
            granite: 7,
            vibranium: 8,
            adamantite: 9,
            unobtanium: 10
        };

        const resources = {

        }

        // let resource_configs = result.map_config.resource_configs;
        //Adds new game elements from resource_configs if they do not already exist
        resource_configs.forEach(resource => {   
            resources[Object.keys(resources).length] = resource.name;
        });

        let gameState = Array.from({ length: ROWS }, () => Array(COLS).fill(elements.unknown));

        function drawASquare(c, r, colour, image) {
            ctx.fillStyle = colour;
            ctx.fillRect(c * GRID_SIZE-borderWidth, r * GRID_SIZE-borderWidth, GRID_SIZE+borderWidth, GRID_SIZE+borderWidth);
            if (image) {
                ctx.drawImage(image, c * GRID_SIZE, r * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            }
        }

        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const element = gameState[row][col];
                    switch (element) {
                        case elements.kFactoryBotOne: // Blue
                            drawASquare(col, row, '#25537b', images.kFactoryBot);  
                            break;
                        case elements.kMiningBotOne: // Blue
                            drawASquare(col, row, '#25537b', images.kMiningBot);
                            break;
                        case elements.kFactoryBotTwo: // Red
                            drawASquare(col, row, '#AA4344', images.kFactoryBot);
                            break;
                        case elements.kMiningBotTwo: // Red
                            drawASquare(col, row, '#AA4344', images.kMiningBot);
                            break;
                        case elements.unknown:
                            drawASquare(col, row, '#221d14');
                            break;
                        case elements.traversable:
                            drawASquare(col, row, '#67583b');
                            break;
                        case elements.resource:
                            ctx.drawImage(images.mixed_ore, col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                            break;
                        case elements.granite:
                            drawASquare(col, row, '#67583b', images.granite);
                            break;
                        case elements.vibranium:
                            drawASquare(col, row, '#67583b', images.vibranium);
                            break;
                        case elements.adamantite:
                            drawASquare(col, row, '#67583b', images.adamantite);
                            break;
                        case elements.unobtanium:
                            drawASquare(col, row, '#67583b', images.unobtanium);
                            break;
                    }
                    if (COLS < MAX_WHITE_WIDTH && ROWS < MAX_WHITE_HEIGHT) {
                        ctx.strokeStyle = 'white'; // set border color to white
                        ctx.lineWidth = 1; // set border width
                        ctx.strokeRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                    }
                }
            }
        }

        // randomState();
        render();

        const ws = new WebSocket(`${ws_type}://${hostname}:${port}/observer`);
        const botMap = new Map();
        const jobMap = new Map();
        const players = {};
        const playerNames = {};
    
        ws.onopen = function () {
            console.log('Connected to WebSocket server');
            const subscribeRequest = JSON.stringify({ game_id: result.game_id, observer_key: 514525537, observer_name: 'Observer' });
            ws.send(subscribeRequest);
        };

        //When receiving message from the server, parses it and applies updates to game accordingly
        ws.onmessage = function (msg) {
            console.log('before parse:', msg);
            try {
                const data = JSON.parse(msg.data);
                console.log('after parse:', data);
                switch (data.update_type) {
                    case 'kTickUpdate':
                        console.log('tick update: ', data)
                        if (Array.isArray(data.bot_updates)) {
                            data.bot_updates.forEach(botUpdate => {
                                console.log('botUpdate: ', botUpdate);
                                updateBot(botUpdate, data.player_id);
                            })
                        }
                        if (Array.isArray(data.job_updates)) {
                            data.job_updates.forEach(jobUpdate => {
                                console.log('jobUpdate: ', jobUpdate);
                                updateJob(jobUpdate);
                            })
                        }
                        if (Array.isArray(data.land_updates)) {
                            data.land_updates.forEach(landUpdate => {
                                console.log('landUpdate: ', landUpdate);
                                updateLand(landUpdate);
                            })
                        }
                        updateUI(data.player_id);
                        render();
                        break;
                    case 'kEndInWin':
                        console.log(`game ended player id ${data.player_id} won`);
                        showWinner(data.player_id);
                        break;
                    case 'kEndInDraw':
                        console.log('game ended in draw');
                        break;
                    default:
                        console.log(data.UpdateType);
                        break;
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        }

        //Sidebars has to be dynamically added if in the future you want >2 players
        const sidebars = [document.getElementById('bot-sidebar-one'), document.getElementById('bot-sidebar-two')];
        //Possibly add more colours for >2 players too
        const colors = ['blue','red'];

        //Updates the bot's position and its job?
        function updateBot(botUpdate, playerId) {
            if(!players.hasOwnProperty(playerId) && Object.keys(players).length < 2){
                players[playerId] = Object.keys(players).length;
            }
            const playerIndex = players[playerId];

            const { id, position, variant, current_energy, current_job_id, cargo } = botUpdate;
            if (botMap.has(id)) {
                var oldPosition = botMap.get(id)[0];
                var oldRow = ROWS - oldPosition.y - 1;
                var oldCol = oldPosition.x;
                gameState[oldRow][oldCol] = elements.traversable;
            }
            var job;
            if(current_job_id == 0){
                job = {action: 'kNoAction', status: 'kNotStarted'};
            }else if(jobMap.has(current_job_id)){
                job = jobMap.get(current_job_id);
            }else{
                job = {action: 'kNoAction', status: 'kNotStarted'};
            }
            botMap.set(id, [position, variant, current_energy, job, cargo, playerIndex]);
            var newRow = ROWS - position.y - 1;
            var newCol = position.x;
            var playerNum = '';
            if(playerIndex == 0){
                playerNum = 'One';
            }else{
                playerNum = 'Two';
            }
            var element = String(variant) + playerNum;
            gameState[newRow][newCol] = elements[element];
            renderBots();
        }

        //?
        function updateJob(data){
            const {id, action, status} = data;
            var job = {action: action, status: status}
            jobMap.set(id, job);
        }
        
        //Updates the state of a tile on the map
        function updateLand(data) {
            const { position: { x, y }, is_traversable, resources} = data;
            if (is_traversable) {
                gameState[ROWS - y - 1][x] = elements.traversable;
            } else {
                if(Array.isArray(resources)){
                    var highestId = -1;
                    resources.forEach(resource => {
                        if(resource.id > highestId){
                            highestId = resource.id;
                        }
                    })

                    switch(highestId){
                        case 0:
                            gameState[ROWS - y - 1][x] = elements.granite;
                            break;
                        case 1:
                            gameState[ROWS - y - 1][x] = elements.vibranium;
                            break;
                        case 2:
                            gameState[ROWS - y - 1][x] = elements.adamantite;
                            break;
                        case 3:
                            gameState[ROWS - y - 1][x] = elements.unobtanium;
                            break;
                        default:
                            gameState[ROWS - y - 1][x] = elements.resource;
                            break;
                    }
                }  
            }
            renderBots();
        }

        function nextGame()
        {
            fetch(`${http_type}://${hostname}:${port}/games`,  {
                method: 'GET'
            })
        }

        //Just the win screen
        function showWinner(playerId) {
            const winnerDiv = document.createElement('div');
            winnerDiv.style.position = 'absolute';
            winnerDiv.style.top = '50%';
            winnerDiv.style.left = '50%';
            winnerDiv.style.transform = 'translate(-50%, -50%)';
            winnerDiv.style.padding = '20px';
            winnerDiv.style.backgroundColor = 'white';
            winnerDiv.style.border = '2px solid black';
            winnerDiv.style.zIndex = '1000';
            winnerDiv.innerHTML = `<h1>Player ${playerId} Won!</h1>`;

            const closeButton = document.createElement('button'); 
            closeButton.innerText = 'X';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '-1px';
            closeButton.style.right = '-1px';
            closeButton.addEventListener('click', () => {
                document.body.removeChild(winnerDiv);
            });

            winnerDiv.appendChild(closeButton); 
            document.body.appendChild(winnerDiv);
        }

        function renderBots(){
            for (const [id, [position, variant, current_energy, job, cargo, playerIndex]] of botMap.entries()) {
                var playerNum = '';
                if(playerIndex == 0){
                    playerNum = 'One';
                }else{
                    playerNum = 'Two';
                }
                var element = String(variant) + playerNum;
                gameState[ROWS - position.y -1][position.x] = elements[element];
            }
        }

        async function updateUI(player_id) {
            if(!players.hasOwnProperty(player_id) && Object.keys(players).length < 2){
                players[player_id] = Object.keys(players).length;
            }

            console.log('Players object:', players);
            console.log('Current player ID:', player_id);

            
            // Player names code: 
            var playerInfo = await fetchPlayerNames(gameId, [player_id]);
            console.log(playerInfo);
            // var name = playerInfo[0].name;

            const playerIndex = players[player_id];
            console.log('playerIndex:', playerIndex);

            const sidebar = sidebars[playerIndex];
            console.log('sidebar:', sidebar);

            const color = colors[playerIndex];

            sidebar.innerHTML = ''; // Clear the existing sidebar content

            const header = document.createElement('h4');
            header.textContent = `Player: ${player_id}`;
            header.style.color = color;
            sidebar.appendChild(header);

            for (const [id, [position, variant, current_energy, job, cargo, botPlayerIndex]] of botMap.entries()) {
                if(playerIndex == botPlayerIndex){ //THIS MIGHT NOT WORK
                    const botDiv = document.createElement('div');
                    console.log('cargo: ', cargo);
                    botDiv.classList.add('bot-info');

                    botDiv.innerHTML = `
                <h4 style="margin: 2px 0; padding: 0;"><b>Bot ID:</b> ${variant}, ${id}</h4>
                <hr style="margin: 2px 0;">
                <p style="margin: 2px 0; padding: 0;"><b>Position:</b> (${position.x}, ${position.y})</p>
                <p style="margin: 2px 0; padding: 0;"><b>Energy:</b> ${current_energy}</p>
                <p style="margin: 2px 0; padding: 0;"><b>Job Info:</b> ${job.action}, ${job.status}</p>
                <hr style="margin: 2px 0;">
            `;

            const cargoContainer = document.createElement('div');

            //Creating a grid: left side will be image of mineral, right side will be count of mineral
            cargoContainer.style = "display: grid; grid-template-columns: auto auto; grid-gap: 0.5vw; padding: 0.5vw"

            // Add each cargo item as a new paragraph
            cargo.forEach(item => {
                //Image of the mineral
                let mineralImage = document.createElement('img')
                mineralImage.src = "./assets/" + String(resources[item.id]) + ".png"
                cargoContainer.appendChild(mineralImage);

                //Text describing how much of the mineral there is
                let mineralAmt = document.createElement('p')
                mineralAmt.innerHTML = `${item.amount}`
                cargoContainer.appendChild(mineralAmt)
            });
                
                    // Append the cargo container to the botDiv
                    botDiv.appendChild(cargoContainer);
                
                    // Append the botDiv to the sidebar
                    sidebar.appendChild(botDiv);
                }
            }
        }

        
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
console.log(servers["localhost"].name);
document.getElementById("navbarDropdownMenuLink").textContent = hostname !== null ? servers[hostname].name : "Choose a server";
drawGame(hostname, port);