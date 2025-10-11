console.log("script loaded");

//Probably some default values for original testing:
// var hostname = "miningbots-api.dev.tk.sg";
// var port = 443;
// var hostname = "localhost";

var hostname, port;
var CONFIG_=SettingsManager.default_settings;
var http_type, ws_type;
var playername_map = {};

function should_confirm_unload() {
    return Object.keys(playername_map).length > 0;
}

document.addEventListener("DOMContentLoaded",()=>{
    console.log("script activated");

    CONFIG_ = SettingsManager.read_settings_cookie();

    // set dark mode
    DarkModeManager.pairDarkMode(CONFIG_);
    DarkModeManager.setDarkMode(DarkModeManager.darkModeEnabled(CONFIG_));

    //require internet access
    if (!navigator.onLine) {
        document.getElementById("navbar").classList.add("no-internet");
        document.getElementById("game-info-container").classList.add("no-internet");
        LoadingBox.setStatus(LoadingBox.Status.NO_INTERNET);
        window.addEventListener("online", ()=>{location.reload();});
        return;
    } else {
        LoadingBox.setStatus(LoadingBox.Status.LOADING);
    }

    // Get hostname from cookie, otherwise leave as null
    let server=CookieUtilities.getCookie("lastServer");
    if (server !== null) hostname = server;

    console.log('host name: ' + hostname);
    
    
    //Dictionary of servers. The key is the hostname, the value is an object with name and port
    //The port can be left undefined if the server uses the default ports (80 for http, 443 for https)
    //The name is what will be displayed in the server selection dropdown
    //The type can be left undefined for normal servers. Special types are:
    //  "custom": prompts the user for a custom socket URL. The URL is saved in a separate cookie "custom_server"
    //  "fe_host": uses the hostname of the frontend server (the one serving this webpage)
    const servers = in_private_scope(()=>{
        const gport=CONFIG_["game_port"];
        const lport = CONFIG_["localhost_port"];
        let servers={};
        ["p","s"].forEach((server_type)=>{
            for(let i=1;i<=10;i++){
                let hostname=`${server_type}${i}.bootcamp.tk.sg`;
                let name;
                switch(server_type){
                    case 's':
                        name=`Staging ${i}`;
                        break;
                    case 'p':
                        if (i==7)
                            name="Main Game";
                        else
                            name=`Game ${i}`;
                        break;
                }
                servers[hostname]={
                    name: name,
                    port: gport
                };
            }
        });
        return Object.assign(servers,{
            "current.invalid": {
                name: "Testing (on frontend server)",
                type:"fe_host"
            },
            "localhost": {
                name: "Testing (on localhost)",
                port: lport,
            },
            "miningbots-api.dev.tk.sg": {
                name: "Development",
                require_security: true
            },
            "custom.invalid": { // invalid special domain by IANA
                name: "Custom...",
                type: "custom"
            }
        });
    });

    //set protocols
    function set_protocols(upgrade_connection){
        if (CONFIG_["require_security"] || upgrade_connection) {
            http_type = "https";
            ws_type = "wss";
        } else {
            http_type = "http";
            ws_type = "ws";
        }
    }

    //set the hostname to the correct hostname if the cookie value is a special one
    if (hostname && servers.hasOwnProperty(hostname)) {
        // helper to update label in navbar
        function setServerName(name){
            document.getElementById("navbarDropdownMenuLink").textContent=`Server: ${name}`;
        }
        // callback for when a valid server socket is obtained
        function server_assigned(isCustomServer) {
            console.log(servers["localhost"].name);
            if(isCustomServer)
                setServerName("Custom");
            else
                setServerName(servers[server].name);
            drawGame();
        }
        // handle the special domains
        switch (servers[hostname].type) {
            case "custom":
                setServerName(servers["custom.invalid"].name);
                function empty_handler() {
                    setServerName("Custom");
                    LoadingBox.setStatus(LoadingBox.Status.SERVER_UNAVAILABLE);
                    setTimeout(NavigationManager.showNavigation,200);
                }
                let socket_obtained;
                function prompt_socket(previous_socket) {
                    DialogUtilities.prompt("Please enter the socket URL for the custom server:", "Socket URL", previous_socket, socket_obtained, empty_handler);
                }
                socket_obtained=function(socket) {
                    socket = socket.trim();
                    try {
                        if(socket.length==0) throw new Error("Socket URL cannot be empty");
                        url=SocketUtilities.breakUpSocket(socket);
                        hostname = url.hostname;
                        CookieUtilities.setCookie("custom_server",socket,"Fri, 31 Dec 9999 23:59:59 GMT",'/')
                        console.log("URL: " + socket);
                        let protocol=url.protocol.substring(0,url.protocol.length-1);
                        with_value((protocol=="https"||protocol=="wss")||CONFIG_["require_security"],(is_secure_protocol)=>{
                            port=SocketUtilities.applyDefaultPort(is_secure_protocol?"https":"http",url.port);
                            set_protocols(is_secure_protocol);
                        });
                        server_assigned(true);
                    } catch (e){
                        DialogUtilities.showDialog(`Error: ${e.message}`, "Error", [{text: "OK", action: ()=>{prompt_socket(socket)}}], "OK");
                    }
                }
                // we don't need to check if the cookie exists, since getCookie will return undefined if it doesn't exist anyways
                let socket=CookieUtilities.getCookie("custom_server");
                if(socket && SocketUtilities.isValidSocket(socket)) {
                    socket_obtained(socket);
                } else {
                    prompt_socket("");
                }
                break;
            case "fe_host":
                hostname=location.hostname;
                port=CONFIG_["localhost_port"];
                custom_server="current";
                set_protocols(servers["localhost"].require_security);
                server_assigned();
                break;
            default:
                console.log("URL: " + servers[hostname].url);
                set_protocols(servers[hostname].require_security);
                port = SocketUtilities.applyDefaultPort(http_type, servers[hostname].port);
                server_assigned();
        }
    } else {
        LoadingBox.setStatus(LoadingBox.Status.SERVER_NO_SELECTION);
    }

    // Function to populate the dropdown menu (server list)
    function populateDropdown() {
        let dropdownMenu = document.getElementById("dropdown-menu");
        object_forEach(servers,(hostname,server) => {
            //create the links and set the text on them
            let menuItem=document.createElement('a');
            menuItem.classList.add("dropdown-item");
            menuItem.innerText=server.name;
            menuItem.href="#";
            menuItem.setAttribute("data-hostname",hostname);
        
            //attach them to the UI
            dropdownMenu.appendChild(menuItem);
        });

        // add click handlers
        dropdownMenu.addEventListener("click", function (event) {
            event.preventDefault();
            if(!event.target.hasAttribute("data-hostname"))return;
            let selectedServerHostname = event.target.getAttribute("data-hostname");
            console.log(selectedServerHostname);
            //let selectedServerName = this.textContent;
            //document.getElementById("navbarDropdownMenuLink").textContent =
            //    selectedServerName;
            CookieUtilities.deleteCookie("custom_server"); // delete the custom server, so if it is picked again, the app will ask for the socket again
            // Save to cookie first
            CookieUtilities.setCookie("lastServer", selectedServerHostname, "Fri, 31 Dec 9999 23:59:59 GMT", "/");
            location.reload();
            // drawGame();
        });
    }
    populateDropdown();
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

        if (!response.ok) throw new Error(`Failed to retrieve player names: ${response.status}`);

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
    const elementTypes=["kFactoryBot","kMiningBot"
                       ,"mixed_ore","granite","vibranium","adamantite","unobtanium"];  
    let images = {};
    const terrainTypes=["grasslands","hills","mountains"];
    let terrainImages={"unknown":new Image()};

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
    elementTypes.forEach((element)=>{
        let imageName=transliterateElementType(element);
        images[element]=new Image();
        images[element].src=`images/${imageName}.png`;
    });

    //iterate over the keys (land types) and set the sources
    terrainTypes.forEach((terrain)=>{
        terrainImages[terrain]=new Image();
        terrainImages[terrain].src=`images/${terrain}.jpg`;
    });
    /*terrainImages.unknown.src = 'images/unknown.jpg';
    terrainImages.grasslands.src = 'images/grassland.jpg';
    terrainImages.hills.src = 'images/hills.jpg';
    terrainImages.mountains.src = 'images/mountain.jpg';*/

    var gameId;
    var gameStatus = "kNotStarted";

    // display the value of the gameStatus on the webpage
    function updateGameStatus(gameStatus_new) {
        gameStatus=gameStatus_new || gameStatus;
        console.log("raw game status: " + gameStatus);
        if (CONFIG_["show_gameStatus"]) document.getElementById("gameStatus").innerHTML = "Game Status: " + NameMaps.mapName("gameStatusMap",gameStatus);
    }

    function updateGameId(game_id) {
        gameId = game_id || gameId;
        if (CONFIG_["show_gameId"])
        document.getElementById("gameId").innerHTML = "Game ID: " + gameId;
    }

    // connect to the server to fetch the list of games
    fetch(`${http_type}://${hostname}:${port}/games`, {
        method: 'GET'
    })
        .then(response => {
            // console.log(response);
            // make the UI ready
            document.getElementById("bot-info-megacontainer").classList.remove("sidebar-hidden");
            // ensure the response is OK
            // if it is, return the games as a JS object
            if (response.ok) {
                // console.log('games:', response);
                LoadingBox.setStatus(LoadingBox.Status.LOADING_COMPLETED);
                return response.json();
            } else {
                throw new Error(`Failed to fetch list of games: ${response.statusText}`);
            }
        })
        // games= list of games, as a JS object
        .then(games => {
            console.log('games:', games);
            // get the first available game
            if(games.length>0){
                game_info=games[0];
            
                // and retrieve info about it
                gameId = game_info.game_id;
                gameStatus = game_info.game_status;

                //show the game status in the navbar
                updateGameStatus();

                //show the game ID in the navbar
                updateGameId();

                // make sure the game is running
                if (gameStatus == 'kEnded') {
                    console.log('failed to subscribe because game has ended');
                    LoadingBox.setStatus(LoadingBox.Status.NO_GAME);
                    throw new Error("cancelled");
                    //return;
                }

                //get the map_config
                let fetch_map_config = fetch(`${http_type}://${hostname}:${port}/map_config?game_id=${gameId}`, {
                    method: 'GET'
                });

                // pass the map_config and game id to the prepper
                return { response: fetch_map_config, game_id: gameId };
            } else {
                LoadingBox.setStatus(LoadingBox.Status.NO_GAME);
                throw new Error("cancelled");
            }
        })
        // prep the map_config for the next function
        // wait for it to return and decode it as json
        .then(async result => {
            let response = await result.response;

            // also ensure the map_config response is OK
            if (response.ok) {
                console.log('Map config fetch response:', response);
                return { map_config: response.json(), game_id: result.game_id }; // pass down the game_id
            } else {
                throw new Error(`Failed to fetch map_config: ${response.statusText}`);
            }
        })
        //result= Map config and game ID taken from server data
        //this is where the actual rendering occurs
        .then(async result => {
            let map_config = await result.map_config;
            console.log('map_config:', map_config);
            // rendring information

            let screenWidth,screenHeight;
            function updateDimensions(lazy_render) {
                // browser window dimensions
                let navbarHeight=document.getElementById("navbar").offsetHeight;
                screenWidth = window.innerWidth;
                screenHeight = window.innerHeight-navbarHeight;
                GRID_SIZE = Math.min(screenWidth / COLS, screenHeight / ROWS); // fit the map on to the screen
                // Update canvas dimensions
                canvas.width = COLS * GRID_SIZE;
                canvas.height = ROWS * GRID_SIZE;
                
                //Since final canvas dimensions are known, resize the container that holds canvas and DIV for bot-info DIVs
                //This allows the bot-info DIVs to be directly right next to the game canvas without any ugly white space
                document.getElementById("game-info-container").style.gridTemplateColumns = canvas.width + "px " + (screenWidth - canvas.width) + "px";

                //Allows the bot-info container to take up as much remaining space as possible (on the right; not any space of game canvas)
                document.getElementById("bot-info-megacontainer").style.width = screenWidth - canvas.width + "px";

                if(!lazy_render)render(); // refresh the canvas
            }

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
            const inverted_colors = [
                'rgb(255,255,0)',    // inverse of blue
                'rgb(0,255,255)',    // inverse of red
                'rgb(255,0,255)',    // inverse of green
                'rgb(0,0,255)',      // inverse of yellow
                'rgb(0,255,255)',    // inverse of purple
                'rgb(0,255,255)',    // inverse of orange
                'rgb(0,255,255)'     // inverse of pink
            ];

            console.log(COLS);

            // browser window dimensions
            updateDimensions(true);
            in_private_scope(()=> {
                let resizeTimeout = null;
                window.addEventListener("resize",(_e)=>{
                    if(resizeTimeout) clearTimeout(resizeTimeout); // clear the timeout if it exists
                    resizeTimeout = setTimeout(()=>{
                        updateDimensions();
                        resizeTimeout=null;
                    },100);
                });
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
            };

            const resources = {

            }

            // let resource_configs = result.map_config.resource_configs;
            //Adds new game elements from resource_configs if they do not already exist
            resource_configs.forEach(resource => {
                resources[Object.keys(resources).length] = resource.name;
                elements[resource.name.toLowerCase()] = 7 + Object.keys(resources).length - 1;
            });

            let gameState = Array.from({ length: ROWS }, () => Array(COLS).fill(elements.unknown)); //all squares are unknown at the start
            let terrains = Array.from({ length: ROWS }, () => Array(COLS).fill(terrainImages.unknown)); //all squares are unknown at the start

            // Draw an image on top of a background image
            // c = column
            // r = row
            function drawASquare(c, r, background, image) {
                if(background)
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
                            //no element, so background only
                            case elements.unknown:
                            case elements.traversable:
                                drawASquare(col, row, terrain); //nothing occupying the space, so no additional image
                                break;
                            case elements.resource:
                                drawASquare(col, row, null, images.mixed_ore);
                                break;
                            /*case elements.granite:
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
                                break;*/
                            default: 
                                if (element >= 500) { // 500 or more means a bot is occupying the space
                                    console.log("EIN: ", element);
                                    let element_ = element - 500;
                                    const variant = (element_ % 2) ? "kFactoryBot" : "kMiningBot";
                                    const botImage = images[variant];
                                    const playerIndex = Math.floor(element_ / 2);
                                    const color = (DarkModeManager.isDarkMode()?inverted_colors:colors)[playerIndex];
                                    console.log(color, " ", variant);
                                    drawABot(col, row, color, botImage);
                                } else {
                                    object_forEach(elements,(name, value)=>{
                                        if(value==element){
                                            for(let i=0;i<Object.keys(resources).length;i++){
                                                if(name.toLowerCase()==resources[i].toLowerCase()){    
                                                    console.log("resource detected: ",name);
                                                    drawASquare(col, row, terrain, images[name]);
                                                }
                                            }
                                        }
                                    });
                                }
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
                const subscribeRequest = JSON.stringify({ game_id: result.game_id, observer_key: CONFIG_["observer_key"], observer_name: 'Observer' });
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
                                    updateGameStatus(data.game_status);
                                    updateUI(data.player_id);
                                    render();
                                    break;
                                case 'kEndInWin':
                                    console.log(`game ended player id ${data.player_id} won`);
                                    updateGameStatus(data.game_status);
                                    showWinner(data.player_id);
                                    break;
                                case 'kEndInDraw':
                                    console.log('game ended in draw');
                                    updateGameStatus(data.game_status);
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
                    job = { action: NameMaps.mapName('actionMap','kNoAction'), status: NameMaps.mapName('statusMap','kNotStarted') };
                } else if (jobMap.has(current_job_id)) {
                    job = jobMap.get(current_job_id);
                } else {
                    job = { action: NameMaps.mapName('actionMap','kNoAction'), status: NameMaps.mapName('statusMap','kNotStarted') };
                }
                botMap.set(id, [position, variant, current_energy, job, cargo, playerIndex]);
                var newRow = ROWS - position.y - 1;
                var newCol = position.x;
                //var playerNum = ''+(playerIndex+1);
                //var element = String(variant) + playerNum;
                //console.log("element "+element);
                gameState[newRow][newCol] = 500 + (playerIndex * 2) + ((variant == "kFactoryBot") ? 1 : 0);
                console.log(`gameState[${newRow}][${newCol}]=${gameState[newRow][newCol]}`);
            }

            //save the display text of a job
            function updateJob(data) {
                const { id, action, status } = data;
                var job = { action: NameMaps.mapName('actionMap',action), status: NameMaps.mapName('statusMap',status) }
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
                let name_insert = playername_map[playerId]["insert"];
                let text = `<h1>Player ${playerId}${name_insert} Won!</h1>`;
                DialogUtilities.showDialog(text,"Game Won");
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
                let name_insert = CONFIG_["show_player_names"] ? ` (${name})` : "";
                if (!playername_map[player_id]) { // make sure player isn't already cached
                    playername_map[player_id] = {"raw":name,"insert":name_insert}; // Store names in hash table. Used by showWinner
                    console.log("before call");
                    if (CONFIG_["show_notifications"] && !ModeManager.IS_PRODUCTION_MODE)
                        NotificationUtilities.sendNotification(`Player ${player_id}${name_insert} joined.`, "", "favicon.ico");
                }

                const playerIndex = players[player_id];
                console.log('playerIndex:', playerIndex);

                const sidebar = getSidebar(playerIndex);
                console.log('sidebar:', sidebar);

                const color = (DarkModeManager.isDarkMode()?inverted_colors:colors)[playerIndex];

                sidebar.innerHTML = ''; // Clear the existing sidebar content

                const header = document.createElement('h4');
                header.classList.add("sidebar-header");
                header.textContent = `Player: ${player_id}${name_insert}`;
                header.style.color = color;
                sidebar.appendChild(header);

                const botBox = document.createElement('div');
                botBox.classList.add("bot-infobox");
                sidebar.appendChild(botBox);
                for (const [id, [position, variant, current_energy, job, cargo, botPlayerIndex]] of botMap.entries()) {
                    if (playerIndex == botPlayerIndex) { //THIS MIGHT NOT WORK
                        const botDiv = document.createElement('div');
                        console.log('cargo: ', cargo);
                        botDiv.classList.add('bot-info');
                        let variantLabel = NameMaps.mapName('variantMap',variant);
                        botDiv.innerHTML = `
            <h4><b>${variantLabel}</b> ${id}</h4>
            <hr>
            <p><b>Position:</b> ${position.x}, ${position.y}</p>
            <p><b>Energy:</b> ${current_energy}</p>
            <p><b>Job:</b> ${job.action}</p> 
            <hr>
        `;
                        // , ${job.status}
                        const cargoContainer = document.createElement('div');

                        //Creating a grid: left side will be image of mineral, right side will be count of mineral
                        cargoContainer.classList.add('cargo-container'); // dealt with in css

                        // Add each cargo item as a new paragraph
                        cargo.forEach(item => {
                            //Image of the mineral
                            let mineralImage = document.createElement('img');
                            mineralImage.classList.add('mineral-image');
                            let resource = String(resources[item.id]);
                            mineralImage.src = "./images/" + resource.toLowerCase() + ".png"
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
            if(error.message=="cancelled")return;
            console.error("Error:", error);
            LoadingBox.setStatus(LoadingBox.Status.SERVER_UNAVAILABLE);
            DialogUtilities.showDialog(`Error connecting to ${http_type}://${hostname}:${port}: <br><br>` + error + "<br><br>The server might be offline.<br>Try selecting another server from the menu.","Connection Failed",[{"text":"OK","action":()=>{
                setTimeout(()=>{
                    let link=document.getElementById("navbarDropdownMenuLink");
                    if(link.ariaExpanded=="false")NavigationManager.showNavigation(); 
                },0);
            }}]);
        });
}