const ARENA_WIDTH = 12;
const ARENA_HEIGHT = 20;
let ARENA = createMatrix(ARENA_WIDTH, ARENA_HEIGHT);

let CANVAS_WIDTH = 300;
let BLOCK = CANVAS_WIDTH/ARENA_WIDTH;
let CANVAS_HEIGHT = ARENA_HEIGHT * BLOCK;

let PAUSED = false;
let STARTED = false;

let canvas = document.getElementById('canvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.id = 'canvas';
let context = canvas.getContext("2d");
context.scale(BLOCK, BLOCK);


const player = {
    pos: {x: 0, y: 0},
    matrix: [],
    color: ''
}

draw();

let points = 0;

let totalTime = 0;
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 800;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if ( dropCounter > dropInterval ) {
        playerDrop();
    }
    draw();
    if( !PAUSED ) {
        requestAnimationFrame(update);
    }
}


function createPiece(type) {
    if( type === 'T' ) {
        player.color = 'purple';
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if( type === 'O' ) {
        player.color = 'yellow';
        return [
            [1, 1],
            [1, 1]
        ];
    } else if( type === 'J' ) {
        player.color = 'blue';
        return [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ];
    } else if( type === 'L' ) {
        player.color = 'red';
        return [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1]
        ];
    } else if( type === 'I' ) {
        player.color = 'lightblue';
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ];
    } else if( type === 'S' ) {
        player.color = 'pink';
        return [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ];
    } else if( type === 'Z' ) {
        player.color = 'orange';
        return [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ];
    }
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if ( value !== 0 ) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerReset(){
    const pieces = 'ILJOTZS';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (ARENA[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if( collide(ARENA, player) ) {
        PAUSED = true;
        document.getElementById("pointsP").innerHTML = `Game over. Points: ${points}`
    }
}

function createMatrix(w, h) {
    let matrix = [];
    for ( let row = 0; row < h; row++ ){
        matrix.push([]);
        for( let column = 0; column < w; column++ ) {
            matrix[row].push(0);
        }
    }
    return matrix;
}

function collide(arena, player) {
    const [matrix, offset] = [player.matrix, player.pos];
    for( let y = 0; y < matrix.length; y++ ){
        for( let x = 0; x < matrix[y].length; x++ ){
            if( matrix[y][x] !== 0 && 
                (arena[y + offset.y] && arena[y + offset.y][x + offset.x]) !== 0 ) {
                    return true;
                }
        }
    }
    return false;
}

function playerDrop() {
    player.pos.y++;
    if( collide(ARENA, player) ) {
        player.pos.y--;
        merge(ARENA, player);
        clearFullLines(ARENA);
        draw();
        playerReset();
    }
    dropCounter = 0;
}
/**
 * 
 * @param {array} row 
 */
function lineFull(row) {
    for( const value of row ) {
        if( value !== 1 ){
            return false;
        }
    }
    // all values must be 1
    return true;
}

function clearFullLines(arena) {
    let addedPoints = 0;
    let clearedRows = 0;
    arena.forEach((row, y) => {
        if ( lineFull(row) ) {
            arena.splice(y, 1);
            let emptyRow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            arena.unshift(emptyRow);
            clearedRows++;
        }
    });
    addedPoints += 100*clearedRows;
    if (clearedRows === 4) {
        addedPoints *= 2;
    }
    points += addedPoints;
}

function instantDrop() {
    while( !collide(ARENA, player) ) {
        player.pos.y++;
    }
    player.pos.y--;
    merge(ARENA, player);
    clearFullLines(ARENA);
    playerReset();
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    let offset = 1;
    while( collide(ARENA, player) ) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while( collide(ARENA, player) ) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if( offset > player.matrix[0].length ) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rect(width, height, x, y, color) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    context.fillStyle = color;
    context.fillRect(this.x, this.y, this.width, this.height);
    context.lineWidth = 0.1;
    context.strokeRect(this.x, this.y, this.width, this.height);
    // context.strokeRect(this.x, this.y, this.width, this.height);
}

function drawMatrix(matrix, offset, color) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if ( value !== 0 ) {
                if( matrix === ARENA ) {
                    rect(1, 1, x + offset.x, y + offset.y, 'red');
                } else {
                    rect(1, 1, x + offset.x, y + offset.y, player.color);
                }
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, ARENA[0].length, ARENA.length);
    // draw grid lines
    ARENA.forEach((row, y) => {
        drawLine(0, y, row.length, y);
    });
    for( let i = 0; i<ARENA[0].length; i++ ){
        drawLine(i, 0, i, ARENA.length);
    }
    drawMatrix(ARENA, {x: 0, y: 0}, 'red');
    drawMatrix(player.matrix, player.pos, 'red' );
}

function drawLine(startX, startY, endX, endY){
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.lineWidth = 0.03;
    context.strokeStyle = "rgba(100, 100, 100, 0.7)";
    context.stroke();
}

function rotate(matrix, dir) {
    for( let y=0; y < matrix.length; y++ ) {
        for( let x=0; x < y; x++ ) {
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                matrix[y][x],
                matrix[x][y]
            ];
        }
    }
    if( dir > 0 ) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Keyboard input with customisable repeat (set to 0 for no key repeat)
// made by StackOverflow user: bobince
function KeyboardController(keys, repeat) {
    // Lookup of key keyCodes to timer ID, or null for no repeat
    //
    var timers= {};
    // When key is pressed and we don't already think it's pressed, call the
    // key action callback and set a timer to generate another one after a delay
    //
    document.onkeydown = function(event) {
        var key = (event || window.event).keyCode;
        if (!(key in keys)) {
            return true;
        }
        if (!(key in timers)) {
            timers[key]= null;
            keys[key]();
            if (repeat!==0)
            timers[key] = setInterval(keys[key], repeat);
            }
        return false;
    }
    // Cancel timeout and mark key as released on keyup
    //
    document.onkeyup = function(event) {
        var key= (event || window.event).keyCode;
        if (key in timers) {
            if (timers[key]!==null)
                clearInterval(timers[key]);
            delete timers[key];
        }
    };
    // When window is unfocused we may not get key events. To prevent this
    // causing a key to 'get stuck down', cancel all held keys
    //
    window.onblur= function() {
        for (key in timers)
            if (timers[key]!==null)
                clearInterval(timers[key]);
        timers= {};
    };
}

let repeat = 60;
let keys = {
    37: function() { playerMove(-1); },
    39: function() { playerMove(1); },
    40: function() { playerDrop(); }
}
KeyboardController(keys, repeat);

document.addEventListener('keydown', function(key) {
    if( STARTED && !PAUSED ){
        if( key.keyCode === 38 ) {
            playerRotate(1);
        }
        else if( key.keyCode === 32 ){
            instantDrop();
        }
    }
    if ( key.key === 'KeyP' && STARTED ){
            startGame();
    }
});

function startGame() {
    if( !STARTED ) { 
        STARTED = true;
        playerReset();
        update();
    } else if( STARTED && !PAUSED ) {
        document.getElementById('pauseBtn').innerHTML = "Pause";
        update();
    }
}

document.getElementById('startBtn').addEventListener('click', function() {
    startGame();
    document.getElementById("startBtn").style = "visibility:hidden;";
    document.getElementById('pauseBtn').style = "visibility:visible;";
    let timeout = setInterval(() => {
        totalTime++;
    }, 1000);
});


document.getElementById('pauseBtn').addEventListener('click', function() {
    document.getElementById('pauseBtn').innerHTML = "Resume";
    PAUSED = !PAUSED;
    startGame();
});

