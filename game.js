const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GRID_SIZE = 10;

var gameId = 0;
var resource_configs = 0;

console.log('Starting fetch request');

fetch('http://pre.bootcamp.tk.sg:9002/games', {
    method: 'GET', 
    headers: {
        'content-type': 'application/json' 
    }
})
.then(response => {
    console.log('checking fetching games');
    if(!response.ok){
        console.log("Error fetching games");
        throw new Error(response.statusText);
    }
    return response.json();
})
.then(data => {
    console.log('fetching map_config');
    gameId = data[0].game_id;
    return fetch(`http://pre.bootcamp.tk.sg:9002/map_config?game_id=${gameId}`, {
        method: 'GET', 
        headers: {
            'content-type': 'application/json' 
        }
    });
})
.then(response => {
    if(!response.ok){
        console.log("Error fetching map_config");
        throw new Error(response.statusText);
    }
    return response.json();
})
.then(data => {
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
                const elements = gameState[row][col];
                    switch(elements){
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

    const ws = new WebSocket('ws://pre.bootcamp.tk.sg:9002');
    const botMap = new Map();

    ws.onopen = function(){
        console.log('Connected to WebSocket server');
        const subscribeRequest = JSON.stringify({ game_id: gameId, observer_key: 514525537, observer_name: 'Observer'});
        ws.send(subscribeRequest);
    };

    ws.onmessage = function(msg){
        try{
            const data = JSON.parse(msg.data);
            if (data.hasOwnProperty('current_energy') && data.hasOwnProperty('current_job_id')) {
                updateBot(data);
            } else if (data.hasOwnProperty('terrain_id') && data.hasOwnProperty('is_traversable')) {
                updateLand(data);
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

console.log('Starting fetch request');
