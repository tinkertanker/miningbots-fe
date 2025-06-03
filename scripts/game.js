console.log("script loaded");

//Probably some default values for original testing:
// var hostname = "miningbots-api.dev.tk.sg";
// var port = 443;
// var hostname = "localhost";

var server=null;
var port;
var CONFIG=default_settings;
var http_type="http";var ws_type="ws";
var custom_server = false;
var gameId;
var playername_cache = {};
var gameStatus = "kNotStarted";
var servers={};

// NOTE: not so secure
function mapName(name,key){
    //HACK: pass a variable as a string so the reading is deferred
    return eval(`typeof ${name} != 'undefined' ? ${name}['${key}'] : '${key}'`);
}

document.addEventListener("DOMContentLoaded",()=>{
    console.log("script activated");
    if (!navigator.onLine) {
        document.getElementById("navbar").classList.add("no-internet");
        document.getElementById("game-info-container").classList.add("no-internet");
        setLoadingBoxStatus(LB_NO_INTERNET);
        window.addEventListener("online", (e) => {
            location.reload();
        });
    } else {
        setLoadingBoxStatus(LB_LOADING);
    }

    // Get hostname from cookie, otherwise leave as null
    server = getCookie("lastServer");
    if (server !== null) hostname = server;

    CONFIG = read_settings_cookie();
    port = CONFIG["localhost_port"];

    console.log('host name: ' + hostname);

    if (CONFIG["enable_security"]) {
        http_type = "https";
        ws_type = "wss";
    } else {
        http_type = "http";
        ws_type = "ws";
    }
    //Dictionary of servers and respective names, urls
    var gport=CONFIG["game_port"];
    servers = {
        "p1.bootcamp.tk.sg": {
            name: "Game 1",
            url: `p1.bootcamp.tk.sg:${gport}`,
        },
        "p2.bootcamp.tk.sg": {
            name: "Game 2",
            url: `p2.bootcamp.tk.sg:${gport}`,
        },
        "p3.bootcamp.tk.sg": {
            name: "Game 3",
            url: `p3.bootcamp.tk.sg:${gport}`,
        },
        "p4.bootcamp.tk.sg": {
            name: "Game 4",
            url: `p4.bootcamp.tk.sg:${gport}`,
        },
        "p5.bootcamp.tk.sg": {
            name: "Game 5",
            url: `p5.bootcamp.tk.sg:${gport}`,
        },
        "p6.bootcamp.tk.sg": {
            name: "Game 6",
            url: `p6.bootcamp.tk.sg:${gport}`,
        },
        "p7.bootcamp.tk.sg": {
            name: "Main Game",
            url: `p7.bootcamp.tk.sg:${gport}`,
        },
        "p8.bootcamp.tk.sg": {
            name: "Game 8",
            url: `p8.bootcamp.tk.sg:${gport}`,
        },
        "p9.bootcamp.tk.sg": {
            name: "Game 9",
            url: `p9.bootcamp.tk.sg:${gport}`,
        },
        "p10.bootcamp.tk.sg": {
            name: "Game 10",
            url: `p10.bootcamp.tk.sg:${gport}`,
        },
        "s1.bootcamp.tk.sg": {
            name: "Staging 1",
            url: `s1.bootcamp.tk.sg:${gport}`,
        },
        "s2.bootcamp.tk.sg": {
            name: "Staging 2",
            url: `s2.bootcamp.tk.sg:${gport}`,
        },
        "s3.bootcamp.tk.sg": {
            name: "Staging 3",
            url: `s3.bootcamp.tk.sg:${gport}`,
        },
        "s4.bootcamp.tk.sg": {
            name: "Staging 4",
            url: `s4.bootcamp.tk.sg:${gport}`,
        },
        "s5.bootcamp.tk.sg": {
            name: "Staging 5",
            url: `s5.bootcamp.tk.sg:${gport}`,
        },
        "s6.bootcamp.tk.sg": {
            name: "Staging 6",
            url: `s6.bootcamp.tk.sg:${gport}`,
        },
        "s7.bootcamp.tk.sg": {
            name: "Staging 7",
            url: `s7.bootcamp.tk.sg:${gport}`,
        },
        "s8.bootcamp.tk.sg": {
            name: "Staging 8",
            url: `s8.bootcamp.tk.sg:${gport}`,
        },
        "s9.bootcamp.tk.sg": {
            name: "Staging 9",
            url: `s9.bootcamp.tk.sg:${gport}`,
        },
        "s10.bootcamp.tk.sg": {
            name: "Staging 10",
            url: `s10.bootcamp.tk.sg:${gport}`,
        },
        "current.invalid": {
            name: "Testing (on frontend server)",
            url: "current.invalid",
        },
        "localhost": {
            name: "Testing (on localhost)",
            url: `localhost:${port}`,
        },
        "miningbots-api.dev.tk.sg": {
            name: "Development",
            url: "miningbots-api.dev.tk.sg",
        },
        "custom.invalid": { // invalid special domain by IANA
            name: "Custom...",
            url: "custom.invalid",
        }
    };
});
function onunload() {
    console.log(gameStatus);
    return gameStatus !== "kNotStarted";
}

document.addEventListener("DOMContentLoaded",()=>{
    if (hostname && servers.hasOwnProperty(hostname)) {
        if (hostname == "custom.invalid") {
            setServerName(servers["custom.invalid"].name);
            let socket=hasCookie("custom_server")?getCookie("custom_server"):undefined;
            while (socket===undefined){
                socket = prompt("Enter socket of server:");
            }
            servers["custom.invalid"].url=socket;
            if (servers["custom.invalid"].url) {
                hostname = getNameOfSocket(servers["custom.invalid"].url);
                setCookie("custom_server",servers["custom.invalid"].url,"Fri, 31 Dec 9999 23:59:59 GMT",'/')
                console.log("URL: " + servers["custom.invalid"].url);
                port = getPortNumber(http_type, servers["custom.invalid"].url);
                custom_server = "custom";
            }
        } else if (hostname == "current.invalid") {
            hostname=location.hostname;
            custom_server="current";
        } else {
            console.log("URL: " + servers[hostname].url);
            port = getPortNumber(http_type, servers[hostname].url);
        }
    } else {
        if(navigator.onLine) {
            setLoadingBoxStatus(LB_SERVER_NO_SELECTION);
        }
    }
});

// Function to populate the dropdown menu (server list)
function populateDropdown() {
    let dropdownMenu = document.getElementById("dropdown-menu");
    Object.keys(servers).forEach(function (key) {
        let server = servers[key];
        let menuItem;
        if(key=="custom.invalid")
            menuItem = `<a class="dropdown-item" href="#" data-url="custom.invalid">${server.name}</a>`;
        else
            menuItem = `<a class="dropdown-item" href="#" data-url="${server.url}">${server.name}</a>`;
        dropdownMenu.innerHTML += menuItem;
    });
}

// Event listener for dropdown item click
document.addEventListener("DOMContentLoaded", function () {
    populateDropdown();

    //convert to array to make it possible to use forEach
    let dropdownItems = Array.from(document.getElementsByClassName("dropdown-item"));
    dropdownItems.forEach(function (item) {
        item.addEventListener("click", function (event) {
            event.preventDefault();
            let selectedServerUrl = this.getAttribute("data-url");
            console.log(selectedServerUrl);
            //let selectedServerName = this.textContent;
            //document.getElementById("navbarDropdownMenuLink").textContent =
            //    selectedServerName;
            deleteCookie("custom_server"); // delete the custom server, so if it is picked again, the app will ask for the socket again
            // Save to cookie first
            setCookie("lastServer", getNameOfSocket(selectedServerUrl), "Fri, 31 Dec 9999 23:59:59 GMT", "/");
            location.reload();
            // drawGame();
        });
    });

    // good time to set dark mode
    pairDarkMode(CONFIG);
    setDarkMode(darkModeEnabled(CONFIG));
});

// Player Name fetch code 
async function fetchPlayerNames(gameId, playerIds) {
    const url = `${http_type}://${hostname}:${port}/players`;
    const playerRequest = { game_id: gameId, player_ids: playerIds };

    try {
        const response = await fetch(`${url}?request=${encodeURIComponent(JSON.stringify(playerRequest))}`, {
            method: 'GET',
            //headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP not-good response from /players: status: ${response.status}`);

        const playerUpdates = await response.json();
        return playerUpdates;
    } catch (error) {
        console.error('Failed to fetch player names:', error);
    }
}

function drawGame() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    //Maybe adjust this to dynamically adapt such that the whole canvas will be shown regardless of map aspect ratio?
    const GRID_SIZE = 32;
    const elementTypes=["kFactoryBot","kMiningBot"
                       ,"mixed_ore","granite","vibranium","adamantite","unobtanium"];  
    let images = {};
    elementTypes.forEach((elementType)=>{
        images[elementType]=new Image();
    })
    const terrainTypes=["grasslands","hills","mountains"];
    let terrainImages={"unknown":new Image()};
    terrainTypes.forEach((terrain)=>{
        terrainImages[terrain]=new Image();
    });

    //Assigns images (preload images)
    function transliterateElementType(elementType){
        if(elementType.charAt(0)=="k")elementType=elementType.substring(1); // example: kMiningBot -> MiningBot
        let upper=0;
        let out="";
        if(elementType.indexOf('_')!=-1){ // snake case
            let words=elementType.split('_');
            for (let index = 0; index < words.length; index++) {
                let word = words[index];
                word=word[0].toUpperCase()+word.substring(1);
                words[index]=word;
            }
            out=words.join('_');
        } else { // camel case
            for (let index = 0; index < elementType.length; index++) {
                const element = elementType[index];
                if(/[A-Z]/.test(element)){ // if capital letter
                    upper++;
                    if(upper>1){ // second or later cap letter
                        out+='_';
                    }
                }
                out+=element;
            }
        }
        return out;
    }
    Object.keys(images).forEach((key)=>{
        let imageName=transliterateElementType(key);
        images[key].src=`images/${imageName}.png`;
    });

    //iterate over the keys (land types) and set the sources
    Object.keys(terrainImages).forEach((key)=>{
        terrainImages[key].src=`images/${key}.jpg`;
    });
    /*terrainImages.unknown.src = 'images/unknown.jpg';
    terrainImages.grasslands.src = 'images/grassland.jpg';
    terrainImages.hills.src = 'images/hills.jpg';
    terrainImages.mountains.src = 'images/mountain.jpg';*/

    // display the value of the gameStatus on the webpage
    function updateGameState() {
        console.log("raw game status: " + gameStatus);
        if (CONFIG["show_game_status"]) document.getElementById("gameStatus").innerHTML = "Game Status: " + mapName("gameStatusMap",gameStatus);
    }

    // connect to the server to fetch the list of games
    fetch(`${http_type}://${hostname}:${port}/games`, {
        method: 'GET'
    })
        .then(response => {
            // console.log(response);
            // make the UI ready
            if (navigator.onLine) setLoadingBoxStatus(LB_LOADING_COMPLETED);
            document.getElementById("bot-info-megacontainer").classList.remove("sidebar-hidden");

            // return the games as a JS object
            if (response.ok) {
                // console.log('games:', response);
                return response.json();
            } else {
                throw new Error(response.statusText);
            }
        })
        // games= list of games, as a JS object
        .then(games => {
            console.log('games:', games);
            // get the first available game
            game_info=games[0];

            // and retrieve info about it
            gameId = game_info.game_id;
            gameStatus = game_info.game_status;

            //post the game status on the DOM
            updateGameState();

            // make sure the game is running
            if (gameStatus == 'kEnded') {
                console.log('failed to subscribe because game has ended');
                return;
            }

            //get the map_config
            let fetch_map_config = fetch(`${http_type}://${hostname}:${port}/map_config?game_id=${gameId}`, {
                method: 'GET'
            });

            //show the game ID in the navbar
            if (CONFIG["show_gameid"])
                document.getElementById("gameID").innerHTML = "Game ID: " + gameId;

            // pass the map_config and game id to the prepper
            return { response: fetch_map_config, game_id: gameId };
        })
        // prep the map_config for the next function
        .then(async result => {
            let response = await result.response;

            if (response.ok) {
                console.log('Map config fetch response:', response);
                return { map_config: response.json(), game_id: result.game_id }; // pass down the game_id
            } else {
                throw new Error(response.statusText);
            }
        })
        //result= Map config and game ID taken from server data
        .then(async result => {
            let map_config = await result.map_config;
            console.log('map_config:', map_config);
            // rendring information

            // browser window dimensions
            var screenWidth = window.innerWidth;
            var screenHeight = window.innerHeight;
            // map dimensions
            const COLS = map_config.max_x;
            const ROWS = map_config.max_y;
            // rendring preferences
            const MAX_WHITE_WIDTH = 60;
            const MAX_WHITE_HEIGHT = 60;
            const borderWidth = 1;
            var GRID_SIZE = Math.min(screenWidth / COLS, screenHeight / ROWS); // fit the map on to the screen
            //Possibly add more colours for >2 players too
            const colors = ['blue', 'red', 'green', 'yellow', 'purple', 'orange', 'pink'];

            console.log(COLS);

            // Update canvas dimensions
            canvas.width = COLS * GRID_SIZE;
            canvas.height = ROWS * GRID_SIZE;

            updateSidebarDimensions();
            window.addEventListener("resize",(e)=>{
                // browser window dimensions
                screenWidth = window.innerWidth;
                screenHeight = window.innerHeight;
                GRID_SIZE = Math.min(screenWidth / COLS, screenHeight / ROWS); // fit the map on to the screen
                // Update canvas dimensions
                canvas.width = COLS * GRID_SIZE;
                canvas.height = ROWS * GRID_SIZE;
                updateSidebarDimensions();
                render(); // refresh the canvas
            });

            let resource_configs = map_config.resource_configs;

            const elements = {
                /*kMiningBotOne: 0,
                kFactoryBotOne: 1,
                kMiningBotTwo: 2,
                kFactoryBotTwo: 3,*/
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

            let gameState = Array.from({ length: ROWS }, () => Array(COLS).fill(elements.unknown)); //all squares are unknown at the start
            let terrains = Array.from({ length: ROWS }, () => Array(COLS).fill(terrainImages.unknown)); //all squares are unknown at the start

            function updateSidebarDimensions() {
                //Since final canvas dimensions are known, resize the container that holds canvas and DIV for bot-info DIVs
                //This allows the bot-info DIVs to be directly right next to the game canvas without any ugly white space
                document.getElementById("game-info-container").style.gridTemplateColumns = canvas.width + "px " + (screenWidth - canvas.width) + "px";

                //Allows the bot-info container to take up as much remaining space as possible (on the right; not any space of game canvas)
                document.getElementById("bot-info-megacontainer").style.width = screenWidth - canvas.width + "px";
            }

            // Draw an image on top of a background image
            // c = column
            // r = row
            function drawASquare(c, r, background, image) {
                ctx.drawImage(background, c * GRID_SIZE - borderWidth, r * GRID_SIZE - borderWidth, GRID_SIZE + borderWidth, GRID_SIZE + borderWidth);
                if (image) { //if an element image was given
                    ctx.drawImage(image, c * GRID_SIZE, r * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                }
            }

            // Draw a bot image on a coloured background
            // c = column
            // r = row
            //this exists because the bots have a background colour that indicates the player they are attached to, instead of the terrain
            //can remove this if the background is also changed to an image 
            function drawABot(c, r, colour, image) {
                ctx.fillStyle = colour;
                ctx.fillRect(c * GRID_SIZE - borderWidth, r * GRID_SIZE - borderWidth, GRID_SIZE + borderWidth, GRID_SIZE + borderWidth);
                ctx.drawImage(image, c * GRID_SIZE, r * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            }

            // Refresh the game canvas
            function render() {
                // Erase the whole game canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (let row = 0; row < ROWS; row++) {
                    for (let col = 0; col < COLS; col++) {
                        const element = gameState[row][col];
                        const terrain = terrains[row][col];
                        switch (element) {
                            /*case elements.kFactoryBotOne: // Blue
                                drawABot(col, row, '#25537b', images.kFactoryBot);
                                //drawASquare(col, row, terrain, images.kFactoryBot);
                                break;
                            case elements.kMiningBotOne: // Blue
                                drawABot(col, row, '#25537b', images.kMiningBot);
                                //drawASquare(col, row, terrain, images.kMiningBot);
                                break;
                            case elements.kFactoryBotTwo: // Red
                                drawABot(col, row, '#AA4344', images.kFactoryBot);
                                //drawASquare(col, row, terrain, images.kFactoryBot);
                                break;
                            case elements.kMiningBotTwo: // Red
                                drawABot(col, row, '#AA4344', images.kMiningBot);
                                //drawASquare(col, row, terrain, images.kMiningBot);
                                break;*/
                            case elements.unknown:
                                drawASquare(col, row, terrain); //nothing occupying the space, so no additional image
                                break;
                            case elements.traversable:
                                drawASquare(col, row, terrain); //nothing occupying the space, so no additional image
                                break;
                            case elements.resource:
                                ctx.drawImage(images.mixed_ore, col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                                break;
                            case elements.granite:
                                drawASquare(col, row, terrain, images.granite);
                                break;
                            case elements.vibranium:
                                drawASquare(col, row, terrain, images.vibranium);
                                break;
                            case elements.adamantite:
                                drawASquare(col, row, terrain, images.adamantite);
                                break;
                            case elements.unobtanium:
                                drawASquare(col, row, terrain, images.unobtanium);
                                break;
                            default: // draw the bot
                                console.log("EIN: ", element);
                                let element_ = element - 20;
                                const variant = (element_ % 2) ? "kFactoryBot" : "kMiningBot";
                                const botImage = images[variant];
                                const playerIndex = Math.floor(element_ / 2);
                                const color = colors[playerIndex];
                                console.log(color, " ", variant);
                                drawABot(col, row, color, botImage);
                        }
                        //console.log("EIN OoS: ",gameState);
                        if (COLS < MAX_WHITE_WIDTH && ROWS < MAX_WHITE_HEIGHT) { //if map is small enough, show white grid
                            ctx.strokeStyle = 'white'; // set border color to white. this will become the separators between the positions
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

            // subscribe to the websocket as soon as it connects
            ws.onopen = function () {
                console.log('Connected to WebSocket server');
                const subscribeRequest = JSON.stringify({ game_id: result.game_id, observer_key: CONFIG["observer_key"], observer_name: 'Observer' });
                ws.send(subscribeRequest);
            };

            //When receiving message from the server, parses it and applies updates to game accordingly
            ws.onmessage = function (msg) {
                console.log('before parse:', msg);
                //try {
                    function text_callback(json_text){
                        try {
                            const data = JSON.parse(json_text);
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
                                    gameStatus = data.game_status;
                                    updateGameState();
                                    updateUI(data.player_id);
                                    render();
                                    break;
                                case 'kEndInWin':
                                    console.log(`game ended player id ${data.player_id} won`);
                                    gameStatus = data.game_status;
                                    updateGameState();
                                    showWinner(data.player_id);
                                    break;
                                case 'kEndInDraw':
                                    console.log('game ended in draw');
                                    gameStatus = data.game_status;
                                    updateGameState();
                                    break;
                                default:
                                    console.log(data.UpdateType);
                                    break;
                            }
                        } catch (error) {
                            console.error('Error parsing message:', error);
                        }
                    }
                    if(typeof msg.data == "string"){
                        text_callback(msg.data);
                    } else {
                        msg.data.text().then(text_callback);
                    }
                //}catch(_e){};
            }
            //Sidebars will be dynamically populated
            if (!sidebars) var sidebars = [];

            //Updates the bot information in the botMap
            function updateBot(botUpdate, playerId) {
                if (!players.hasOwnProperty(playerId)) {
                    players[playerId] = Object.keys(players).length;
                    updateSidebars(playerId);
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
                // update the displayed job information
                // It won't be displayed yet however
                if (current_job_id == 0) {
                    job = { action: mapName('actionMap','kNoAction'), status: mapName('statusMap','kNotStarted') };
                } else if (jobMap.has(current_job_id)) {
                    job = jobMap.get(current_job_id);
                } else {
                    job = { action: mapName('actionMap','kNoAction'), status: mapName('statusMap','kNotStarted') };
                }
                botMap.set(id, [position, variant, current_energy, job, cargo, playerIndex]);
                var newRow = ROWS - position.y - 1;
                var newCol = position.x;
                //var playerNum = ''+(playerIndex+1);
                //var element = String(variant) + playerNum;
                //console.log("element "+element);
                gameState[newRow][newCol] = 20 + (playerIndex * 2) + ((variant == "kFactoryBot") ? 1 : 0);
                console.log(`gameState[${newRow}][${newCol}]=${gameState[newRow][newCol]}`);
            }

            //save the display text of a job
            function updateJob(data) {
                const { id, action, status } = data;
                var job = { action: mapName('actionMap',action), status: mapName('statusMap',status) }
                jobMap.set(id, job);
            }

            //Updates the state of a tile on the map
            function updateLand(data) {
                const { position: { x, y }, is_traversable, resources, terrain_id } = data;
                /*switch (terrain_id) {
                    case 0:
                        terrains[ROWS - y - 1][x] = terrainImages.grasslands;
                        break;
                    case 1:
                        terrains[ROWS - y - 1][x] = terrainImages.hills;
                        break
                    case 2:
                        terrains[ROWS - y - 1][x] = terrainImages.mountains;
                        break;
                    default:
                        terrains[ROWS - y - 1][x] = terrainImages.unknown;
                }*/
               let landType=map_config.terrain_configs[terrain_id].name.toLowerCase();
               var image;
               if(terrainImages[landType])image=terrainImages[landType];
               else image=terrainImages.unknown;
               terrains[ROWS - y -1][x] = image;

                if (is_traversable) {
                    gameState[ROWS - y - 1][x] = elements.traversable;
                } else {
                    if (Array.isArray(resources)) {
                        // Fetch highest resource ID at that location
                        var highestId = -1;
                        resources.forEach(resource => {
                            if (resource.id > highestId) {
                                highestId = resource.id;
                            }
                        })

                        // Place the appropriate element
                        /*switch (highestId) {
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
                            // If element unknown place elements.resource (displayed as Mixed_Ore.png)
                            default:
                                gameState[ROWS - y - 1][x] = elements.resource;
                                break;
                        }*/
                        let resourceType=map_config.resource_configs[highestId].name.toLowerCase();
                        var element;
                        if(elements[resourceType])element=elements[resourceType];
                        else element=elements.resource;
                        gameState[ROWS - y -1][x] = element;
                    }
                }
                //renderBots();
            }

            //Display a dialog box in the middle of the screen indicating the winner
            function showWinner(playerId) {
                let name_insert = CONFIG["show_player_names"] ? ` (${playername_cache[playerId]})` : "";
                let text = `<h1>Player ${playerId}${name_insert} Won!</h1>`;
                showDialog(text,"Game Won");
            }

            //shows a row for each player showing each bot and their data
            async function updateUI(player_id) {
                if (!players.hasOwnProperty(player_id)) {
                    console.log("caching player " + player_id);
                    players[player_id] = Object.keys(players).length;
                    updateSidebars(player_id);
                }

                console.log('Players object:', players);
                console.log('Current player ID:', player_id);


                // Player names code:
                console.log(gameId);
                let playerInfo = await fetchPlayerNames(gameId, [player_id]);
                console.log(playerInfo);
                var name = playerInfo[0].name;
                let name_insert = CONFIG["show_player_names"] ? ` (${name})` : "";
                if (!playername_cache[player_id]) { // make sure player isn't already cached
                    playername_cache[player_id] = name; // Store names in hash table. Used by showWinner
                    console.log("before call");
                    if (CONFIG["show_notifications"] && !PRODUCTION_MODE)
                        sendNotification(`Player ${player_id}${name_insert} joined.`, "", "favicon.ico");
                }

                const playerIndex = players[player_id];
                console.log('playerIndex:', playerIndex);

                const sidebar = getSidebar(playerIndex);
                console.log('sidebar:', sidebar);

                const color = colors[playerIndex];

                sidebar.innerHTML = ''; // Clear the existing sidebar content

                const header = document.createElement('h4');
                header.textContent = `Player: ${player_id}${name_insert}`;
                header.style.color = color;
                header.style.fontSize = "0.8vw";
                header.style.margin = "0vw";
                header.style.padding = "0.05vw";
                sidebar.appendChild(header);

                const botBox = document.createElement('div');
                botBox.style = "display: flex; gap: 0vw; padding: 0vw, margin: 0.1vw; height: 100%; width: 100%; overflow-y: auto";
                sidebar.appendChild(botBox);
                for (const [id, [position, variant, current_energy, job, cargo, botPlayerIndex]] of botMap.entries()) {
                    if (playerIndex == botPlayerIndex) { //THIS MIGHT NOT WORK
                        const botDiv = document.createElement('div');
                        console.log('cargo: ', cargo);
                        botDiv.classList.add('bot-info');
                        botDiv.style = "width: 14%, height: 24%";
                        let variantLabel = mapName('variantMap',variant);
                        botDiv.innerHTML = `
            <h4 style="margin: 2px 0; padding: 0;"><b>${variantLabel}</b> ${id}</h4>
            <hr style="margin: 2px 0;">
            <p style="margin: 2px 0; padding: 0;"><b>Position:</b> ${position.x}, ${position.y}</p>
            <p style="margin: 2px 0; padding: 0;"><b>Energy:</b> ${current_energy}</p>
            <p style="margin: 2px 0; padding: 0;"><b>Job:</b> ${job.action}</p> 
            <hr style="margin: 2px 0;">
        `;
                        // , ${job.status}
                        const cargoContainer = document.createElement('div');

                        //Creating a grid: left side will be image of mineral, right side will be count of mineral
                        cargoContainer.style = "display: grid; grid-template-columns: auto auto; grid-gap: 0.05vw; padding: 0.1vw"

                        // Add each cargo item as a new paragraph
                        cargo.forEach(item => {
                            //Image of the mineral
                            let mineralImage = document.createElement('img');
                            let resource = String(resources[item.id]);
                            mineralImage.src = "./images/" + resource + ".png"
                            mineralImage.style = "width: 1vw; height: 1vw"
                            mineralImage.alt = mineralImage.title = resource;
                            cargoContainer.appendChild(mineralImage);

                            //Text describing how much of the mineral there is
                            let mineralAmt = document.createElement('p')
                            mineralAmt.innerHTML = `${item.amount}`
                            cargoContainer.appendChild(mineralAmt)
                        });

                        // Append the cargo container to the botDiv
                        botDiv.appendChild(cargoContainer);

                        // Append the botDiv to the sidebar
                        botBox.appendChild(botDiv);
                    }
                }

                function getSidebar(sidebar_number) {
                    return document.getElementById("bot-sidebar-" + sidebar_number);
                }
            }



            //add a sidebar for a new player
            function updateSidebars(player_id) {
                // Dynamically add sidebars
                let sidebar = document.createElement("div");
                sidebar.classList.add("sidebar");
                sidebar.id = "bot-sidebar-" + players[player_id];
                document.getElementById("bot-info-megacontainer").appendChild(sidebar);
                // Refresh the list of sidebars
                sidebars = Array.from(document.querySelectorAll(".sidebar"));
            }
        })
        // if an error occurs in any part to the above code
        .catch((error) => {
            console.error("Error:", error);
            if (navigator.onLine) {
                setLoadingBoxStatus(LB_SERVER_UNAVAILABLE);
                setTimeout(function () {
                    if (server != undefined) {
                        // if the custom option is selected but the user canceled the selection, don't show an error dialog
                        if (hostname != "custom.invalid")
                            alert(`Error connecting to ${http_type}://${hostname}:${port}: ` + error + "\nThe server might be offline.\nTry selecting another server from the menu."); // If a server is selected, check if it exists
                        // auto show the dropdown menu
                        setTimeout(function () {
                            let link=document.getElementById("navbarDropdownMenuLink");
                            if(link.ariaExpanded=="false")link.dispatchEvent(new Event("click")); 
                        }, 400);
                    }
                }, 400);
            }
        });
}
document.addEventListener("DOMContentLoaded", (_e) => {
console.log(servers["localhost"].name);
switch(custom_server){
    case false:
        setServerName(hostname !== null ? servers[hostname].name : "Choose a server");
        break;
    case "current":
        setServerName(servers["current.invalid"].name);
        break;
    case "custom":
        setServerName("Custom");
        break;
}
if(navigator.onLine){
    drawGame();
}
});