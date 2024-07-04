const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GRID_SIZE = 10;
var gameId;
var gameStatus;
var resource_configs;
console.log('script ran');

var hostname = 'pre.bootcamp.tk.sg';
var port = 9002;
fetch(`http://${hostname}:${port}/games`, {
        method: 'GET',
        mode: 'no-cors'
    })
    .then(response => {
        console.log(response);
        if (response.ok) {
            console.log('First fetch response:', response);
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    })
    .then(data => {
        console.log('First fetch data:', data);
        gameId = data[0].game_id;
        gameStatus = data[0].game_status;
        if (gameStatus == 'kEnded') {
            console.log('failed to subscribe because game has ended');
            return;
        }
        return fetch(`http://${hostname}:${port}/map_config?game_id=${gameId}`, {
            method: 'GET',
            mode: 'no-cors'
        });
    })
    .then(response => {
        if(response.ok){
            console.log('Second fetch response:', response);
            return response.json();
        }else{
            throw new Error(response.statusText);
        }
    })
    .then(data => {
        console.log('Second fetch data:', data);
        canvas.width = data.max_x * GRID_SIZE;
        canvas.height = data.max_y * GRID_SIZE;
        resource_configs = data.resource_configs;

        const ROWS = canvas.height / GRID_SIZE;
        const COLS = canvas.width / GRID_SIZE;  

        const elements = {
            EMPTY: 0,
            kFactoryBot: 1,
            kMiningBot: 2,
            Granite: 3,
            Vibranium: 4,
            Adamantite: 5,
            Unobtanium: 6,
        };

        //Adds new game elements from resource_configs if they do not already exist
        resource_configs.forEach(resource => {
            if(!(resource.name in elements)){
                elements[resource.name] = Object.keys(elements).length;
            }
        });

        let gameState = Array.from({length: ROWS}, () => Array(COLS).fill(elements.EMPTY));

        function randomState(){
            for(let row = 0; row < ROWS; row++){
                for(let col = 0; col < COLS; col++){
                    gameState[row][col] = Math.floor(Math.random() * Object.keys(elements).length);
                }
            }
            console.log(gameState);
        }

        function render(){
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for(let row = 0; row < ROWS; row++){
                for(let col = 0; col < COLS; col++){
                    const element = gameState[row][col];
                        switch(element){
                            case elements.EMPTY:
                                ctx.fillStyle = 'black';
                                break;
                            case elements.kFactoryBot:
                                ctx.fillStyle = 'gray';
                                break;
                            case elements.kMiningBot:
                                ctx.fillStyle = 'lightgray';
                                break;
                            case elements.Granite:
                                ctx.fillStyle = '#B22222'; // Reddish variant for Granite
                                break;
                            case elements.Vibranium:
                                ctx.fillStyle = '#4682B4'; // Metallic blue for Vibranium
                                break;
                            case elements.Adamantite:
                                ctx.fillStyle = '#006400'; // Dark green for Adamantite
                                break;
                            case elements.Unobtanium:
                                ctx.fillStyle = '#800080'; // Deep purple for Unobtanium
                                break;
                            //place holder for future resources;
                            case 7:
                                ctx.fillStyle = 'yellow';
                                break;
                            case 8:
                                ctx.fillStyle = 'pink';
                                break;
                            case 9:
                                ctx.fillStyle = 'orange'
                                break;
                        }
                        ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                }      
            }
        }

        randomState();
        render();

        const ws = new WebSocket('ws://pre.bootcamp.tk.sg:9002/Observers');
        const botMap = new Map();

        ws.onopen = function(){
            console.log('Connected to WebSocket server');
            const subscribeRequest = JSON.stringify({ game_id: gameId, observer_key: 514525537, observer_name: 'Observer'});
            ws.send(subscribeRequest);
        };

        ws.onmessage = function(msg){
            try{
                const data = JSON.parse(msg.data);
                if(Array.isArray(data.bot_updates)){
                    data.bot_updates.forEach(botUpdate => {
                        updateBot(botUpdate);
                    })
                }
                if(Array.isArray(data.land_updates)){
                    data.land_updates.forEach(landUpdate => {
                        updateLand(landUpdate);
                    })
                }
            }catch(error){
                console.error('Error parsing message:', error);
            }
        }

        function updateBot(data){
            const {id, position, variant} = data;
            if(!botMap.has(id)){
                botMap.set(id, position);
            }else{
                var oldPosition = botMap.get(id);
                var oldX = oldPosition.x;
                var oldY = oldPosition.y;
                gameState[oldX][oldY] = elements.EMPTY;
            }
            var newX = position.x;
            var newY = position.y;
            botMap.set(id, position);
            gameState[newX][newY] = elements[variant];
        }

        function updateLand(data){
            const {position: {x, y}, is_traversable} = data;
            if(is_traversable){
                gameState[x][y] = elements.EMPTY;
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

