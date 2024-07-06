const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GRID_SIZE = 32;
console.log('script started');

var hostname = 'pre.bootcamp.tk.sg';
var port = 9005;

const images = {
    kFactoryBot: new Image(),
    kMiningBot: new Image(),
    mixed_ore: new Image()
};

images.kFactoryBot.src = 'assets/Factory_Bot.png';
images.kMiningBot.src = 'assets/Mining_Bot.png';
images.mixed_ore.src = 'assets/Mixed_Ore.png';

fetch(`http://${hostname}:${port}/games`, {
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
        let fetch_map_config = fetch(`http://${hostname}:${port}/map_config?game_id=${gameId}`, {
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
    .then(async result => {
        let map_config = await result.map_config;
        console.log('map_config:', map_config);
        canvas.width = map_config.max_x * GRID_SIZE;
        canvas.height = map_config.max_y * GRID_SIZE;
        let resource_configs = map_config.resource_configs;

        const COLS = map_config.max_x;
        const ROWS = map_config.max_y;

        const elements = {
            kMiningBot: 0,
            kFactoryBot: 1,
            unknown: 2,
            traversable: 3,
            resource: 4,
        };

        const resources = {

        }

        // let resource_configs = result.map_config.resource_configs;
        //Adds new game elements from resource_configs if they do not already exist
        resource_configs.forEach(resource => {   
            resources[Object.keys(resources).length] = resource.name;
        });

        let gameState = Array.from({ length: ROWS }, () => Array(COLS).fill(elements.unknown));

        // function randomState(){
        //     for(let row = 0; row < ROWS; row++){
        //         for(let col = 0; col < COLS; col++){
        //             gameState[row][col] = Math.floor(Math.random() * Object.keys(elements).length);
        //         }
        //     }
        //     console.log(gameState);
        // }

        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const element = gameState[row][col];
                    switch (element) {
                        case elements.kFactoryBot:
                            ctx.drawImage(images.kFactoryBot, col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);     
                            // ctx.fillStyle = 'rgb(169, 169, 169)'; // medium light gray
                            break;
                        case elements.kMiningBot:
                            ctx.drawImage(images.kMiningBot, col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                            // ctx.fillStyle = 'rgb(211, 211, 211)'; // lighter shade of gray
                            break;
                        case elements.unknown:
                            ctx.fillStyle = 'black'; //'rgb(64, 64, 64)'; // very dark gray
                            ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                            ctx.strokeStyle = 'white'; // set border color to white
                            ctx.lineWidth = 1; // set border width
                            ctx.strokeRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                            break;
                        case elements.traversable:
                            ctx.fillStyle = 'green'; //'rgb(105, 105, 105)'; // dark gray
                            ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                            ctx.strokeStyle = 'white'; // set border color to white
                            ctx.lineWidth = 1; // set border width
                            ctx.strokeRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                            break;
                        case elements.resource:
                            ctx.drawImage(images.mixed_ore, col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                            // ctx.fillStyle = 'purple';
                            break;
                    }
                }
            }
        }

        // randomState();
        render();

        const ws = new WebSocket(`ws://${hostname}:${port}/observer`);
        const botMap = new Map();
        const jobMap = new Map();
        const players = {

        };

        ws.onopen = function () {
            console.log('Connected to WebSocket server');
            const subscribeRequest = JSON.stringify({ game_id: result.game_id, observer_key: 514525537, observer_name: 'Observer' });
            ws.send(subscribeRequest);
        };

        ws.onmessage = function (msg) {
            console.log('before parse:', msg);
            try {
               // if (isJsonString(msg.data)) {
                    const data = JSON.parse(msg.data);
                    console.log('after parse:', data);
                    switch (data.update_type) {
                        case 'kTickUpdate':
                            console.log('tick update: ', data)
                            if (Array.isArray(data.bot_updates)) {
                                data.bot_updates.forEach(botUpdate => {
                                    console.log('botUpdate: ', botUpdate);
                                    updateBot(botUpdate);
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
                            updateSidebar(data.player_id);
                            render();
                            break;
                        //did not include kEndInWin because observer recieves both loss & win updates
                        case 'kEndInWin':
                            console.log(`game ended player id ${data.player_id} won`);
                            break;
                        case 'kEndInDraw':
                            console.log('game ended in draw');
                            break;
                        default:
                            console.log(data.UpdateType);
                            break;
                    }
                // } else {
                //     console.log(msg.data);
                // }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        }

        // function isJsonString(str) {
        //     try {
        //         JSON.parse(str);
        //     } catch (e) {
        //         return false;
        //     }
        //     return true;
        // }

        function updateBot(data) {
            const { id, position, variant, current_energy, current_job_id, cargo } = data;
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
            botMap.set(id, [position, variant, current_energy, job, cargo]);
            var newRow = ROWS - position.y - 1;
            var newCol = position.x;
            gameState[newRow][newCol] = elements[variant];
            renderBots();
            //updateSidebar();
        }

        function updateJob(data){
            const {id, action, status} = data;
            var job = {action: action, status: status}
            jobMap.set(id, job);
        }

        function updateLand(data) {
            const { position: { x, y }, is_traversable } = data;
            if (is_traversable) {
                gameState[ROWS - y - 1][x] = elements.traversable;
            } else {
                gameState[ROWS - y - 1][x] = elements.resource;
            }
            renderBots();
        }

        function renderBots(){
            for (const [id, [position, variant, current_energy, job, cargo]] of botMap.entries()) {
                gameState[ROWS - position.y -1][position.x] = elements[variant];
            }
        }

        function updateSidebar(data) {
            if(!players.hasOwnProperty(data) && Object.keys(players).length < 2){
                players[data] = Object.keys(players).length;
            }

            console.log('Players object:', players);
            console.log('Current player ID:', data);

            const sidebars = [
                document.getElementById('bot-sidebar-one'),
                document.getElementById('bot-sidebar-two')
            ];
            const sidebarKey = players[data];
            console.log('sidebarKey:', sidebarKey);
            const sidebar = sidebars[sidebarKey];
            console.log('sidebar:', sidebar);

            sidebar.innerHTML = ''; // Clear the existing sidebar content

            const header = document.createElement('h3');
            header.textContent = `Player: ${data}`;
            sidebar.appendChild(header);

            for (const [id, [position, variant, current_energy, job, cargo]] of botMap.entries()) {
                const botDiv = document.createElement('div');
                console.log('cargo: ', cargo);
                botDiv.classList.add('bot-info');
            
                // Set the inner HTML of botDiv with all the details including cargo
                botDiv.innerHTML = `
                    <h4>Bot ID: ${variant}, ${id}</h4>
                    <p>Position: (${position.x}, ${position.y}), Energy: ${current_energy}</p>
                    <p>Job Info: ${job.action}, ${job.status}</p>
                `;

                const cargoContainer = document.createElement('div');
                // Add each cargo item as a new paragraph
                cargo.forEach(item => {
                    const cargoItem = document.createElement('p');
                    cargoItem.textContent = `${resources[item.id]}: ${item.amount}`;
                    cargoContainer.appendChild(cargoItem);
                });
            
                // Append the cargo container to the botDiv
                botDiv.appendChild(cargoContainer);
            
                // Append the botDiv to the sidebar
                sidebar.appendChild(botDiv);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });