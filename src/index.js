const ARENA_WIDTH = 12;
const ARENA_HEIGHT = 20;
let ARENA = createMatrix(ARENA_WIDTH, ARENA_HEIGHT);

let CANVAS_WIDTH = 300;
let BLOCK = CANVAS_WIDTH/ARENA_WIDTH;
let CANVAS_HEIGHT = ARENA_HEIGHT * BLOCK;

let PAUSED = false;
let STARTED = false;

let canvas = document.createElement('canvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.id = 'canvas';
let context = canvas.getContext("2d");
context.scale(BLOCK, BLOCK);
document.body.insertBefore(canvas, document.body.childNodes[0]);

const player = {
    pos: {x: 0, y: 0},
    matrix: []
}

playerReset();

let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if ( dropCounter > dropInterval ) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if ( value !== 0 ) {
                rect(1, 1, x + offset.x, y + offset.y, 'red');
            }
        });
    });
}

function createPiece(type) {
    if( type === 'T' ) {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if( type === 'O' ) {
        return [
            [1, 1],
            [1, 1]
        ];
    } else if( type === 'J' ) {
        return [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0]
        ];
    } else if( type === 'L' ) {
        return [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1]
        ];
    } else if( type === 'I' ) {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ];
    } else if( type === 'S' ) {
        return [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ];
    } else if( type === 'Z' ) {
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
}

// check all lines
// if line doesn't have any 0's
// clear line
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
        merge(ARENA, player);
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
    arena.forEach((row, y) => {
        if ( lineFull(row) ) {
            arena.splice(y, 1);
            let emptyRow = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            arena.unshift(emptyRow);
        }
    });
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
    ctx = context;
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // ctx.strokeRect(this.x, this.y, this.width, this.height);
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawMatrix(ARENA, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
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

// function checkFullRow(row){
//     for( let x of row ) {
//         if ( x === 0 ) {
//             return false;
//         }
//     }
//     return true;
// }

// let lineCount = 0;
// function line(arena) {
//     for ( let y = 0; y < arena.length; y++ ) {
//         if ( checkFullRow(arena[y]) ) {
//             lineCount++;
//             console.log(lineCount);
//         }
//     }
// }

let keysPressed = {};

document.addEventListener('keydown', function(key) {
    if( STARTED && !PAUSED ){
        if( key.code === 'ArrowUp' ) {
            playerRotate(1);
        }
        else if( key.code === 'KeyQ' ) {
            playerRotate(-1);
        }
        else if( (key.code === 'ArrowLeft') ){
            playerMove(-1);
        }
        else if( (key.code === 'ArrowRight') ){
            playerMove(1);
        }
        else if( key.code === 'ArrowDown' ){
            playerDrop();
        }
        else if( key.code === 'Space' ){
            instantDrop();
        }
    }
    if ( key.code === 'KeyP' && STARTED ){
            pauseGame();
    }
});
document.addEventListener('keyup', function(key) {
    if ( key.code in keysPressed ) {
        keysPressed[key.code] = false;
    }
});

function startGame() {
    if( !STARTED ) { 
        STARTED = true;
        update();
    } else if( STARTED && !PAUSED ) {
        update();
    }
}

document.getElementById('startBtn').addEventListener('click', function() {
    startGame();
});

// document.getElementById('pauseBtn').addEventListener('click', function() {
//     PAUSED = !PAUSED;
//     startGame();
// });

