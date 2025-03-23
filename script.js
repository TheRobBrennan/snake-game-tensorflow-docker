// Get canvas and set up rendering context with Safari compatibility
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // Keep alpha for proper rendering

// Game configuration
const cellSize = 30; // Smaller cell size for better mobile experience
const rows = 20;
const columns = 20;
const totalCells = rows * columns;
const bitMask = new Uint32Array(Math.ceil(totalCells / 32));

// Responsive canvas sizing
function resizeCanvas() {
  const container = document.querySelector('.canvas-container');
  const maxSize = Math.min(container.clientWidth, window.innerHeight * 0.6);
  const size = Math.min(600, maxSize);

  // Set canvas dimensions maintaining aspect ratio
  canvas.width = size;
  canvas.height = size;

  // Redraw if game is in progress
  if (snake && snake.length > 0) {
    draw();
  }
}

// Initialize canvas and apply Safari-specific optimizations
window.addEventListener('DOMContentLoaded', function () {
  resizeCanvas();
  ctx.imageSmoothingEnabled = false;
  if (ctx.webkitImageSmoothingEnabled !== undefined) {
    ctx.webkitImageSmoothingEnabled = false;
  }
});

// Listen for window resize events
window.addEventListener('resize', resizeCanvas);

const directions = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 }
];

let snake;
let fruit;
let gameInterval;
let gameMode = 'manual';
let model;
let score = 0;
var speedDifficulty = 75;
var posX = 20;
var posY = 20;
var gameSize = 20;
var accelerationX = 15;
var accelerationY = 15;
var velocityX = 0;
var velocityY = 0;
var path = [];
var setTail = 1;
var length = setTail;
var highScore = 0;
var speedDifficulty = 75;
var movementLog = [];
var currGen = 0;
var gameRunning = true;
var direction = ['left', 'forward', 'right'];
var xApple = Math.floor(Math.random() * gameSize);
var yApple = Math.floor(Math.random() * gameSize);
var loopsSinceApple = 0;

// Game control event listeners
document.getElementById('mode').addEventListener('change', function () {
  gameMode = this.value;
});

document.getElementById('startGame').addEventListener('click', function () {
  if (gameMode === 'model') {
    // Initialize AI game state
    document.getElementById('startGame').style.display = 'none';
    document.getElementById('restartGame').style.display = 'inline';
    score = 0;
    document.getElementById('score').innerText = score;
    // Clear any existing intervals
    if (gameInterval) {
      clearInterval(gameInterval);
    }
    // Start the AI game loop
    gameInterval = setInterval(game, speedDifficulty);
  } else {
    startGame();
  }
});

document.getElementById('restartGame').addEventListener('click', function () {
  resetGame();
});

// Mobile control buttons
const upBtn = document.getElementById('up-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const downBtn = document.getElementById('down-btn');

// Add touch and click events for mobile controls
upBtn.addEventListener('click', () => handleMobileControl({ keyCode: 38 }));
leftBtn.addEventListener('click', () => handleMobileControl({ keyCode: 37 }));
rightBtn.addEventListener('click', () => handleMobileControl({ keyCode: 39 }));
downBtn.addEventListener('click', () => handleMobileControl({ keyCode: 40 }));

// Touch events for mobile buttons
upBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleMobileControl({ keyCode: 38 });
});

leftBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleMobileControl({ keyCode: 37 });
});

rightBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleMobileControl({ keyCode: 39 });
});

downBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleMobileControl({ keyCode: 40 });
});

// Function to handle mobile control input
function handleMobileControl(event) {
  // Only process mobile controls if we're in manual mode and the game is running
  if (gameMode === 'manual' && gameInterval) {
    changeDirection(event);
  } else if (gameMode === 'manual' && !gameInterval && document.getElementById('startGame').style.display === 'none') {
    // If game is over but restart button is showing, allow mobile controls to restart
    resetGame();
    startGame();
  }
}

function startGame() {
  console.log('Starting game...');
  score = 0;
  document.getElementById('score').innerText = score;
  document.getElementById('startGame').style.display = 'none';
  document.getElementById('restartGame').style.display = 'inline';
  setup();
  // Draw the initial state
  draw();
}

function setup() {
  console.log('Setting up game...');
  snake = [{ x: 5, y: 5 }];
  direction = { x: 1, y: 0 };
  clearBoard();
  setBit(snake[0].x, snake[0].y);
  placeFruit();

  // Clear any existing intervals to prevent multiple loops
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }

  // Remove any existing event listeners to prevent duplicates
  window.removeEventListener('keydown', changeDirection);

  if (gameMode === 'model') {
    console.log('Starting AI game loop');
    gameInterval = setInterval(game, 100);
  } else {
    console.log('Starting manual game loop');
    gameInterval = setInterval(gameLoopManual, 100);
    window.addEventListener('keydown', changeDirection);
  }
}

function placeFruit() {
  let x, y;
  do {
    x = Math.floor(Math.random() * columns);
    y = Math.floor(Math.random() * rows);
  } while (getBit(x, y));
  fruit = { x, y };
  console.log('Fruit placed at:', fruit);
}

function gameLoopManual() {
  if (!snake || snake.length === 0) return;

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  // Check boundary collision
  if (head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows) {
    gameOver();
    return;
  }

  // Check self collision
  if (checkCollision(head)) {
    gameOver();
    return;
  }

  // Add new head
  snake.unshift(head);
  setBit(head.x, head.y);

  // Check if snake ate the fruit
  if (head.x === fruit.x && head.y === fruit.y) {
    score++;
    document.getElementById('score').innerText = score;
    placeFruit();
  } else {
    // Remove tail if no fruit was eaten
    const tail = snake.pop();
    clearBit(tail.x, tail.y);
  }

  // Update the display
  draw();
}

function checkCollision(head) {
  return getBit(head.x, head.y) && !(head.x === snake[1]?.x && head.y === snake[1]?.y);
}

function changeDirection(event) {
  const { keyCode } = event;

  // Only change direction if it's not a 180-degree turn
  if (keyCode === 37 && direction.x === 0) {
    // Left arrow
    direction = { x: -1, y: 0 };
  } else if (keyCode === 38 && direction.y === 0) {
    // Up arrow
    direction = { x: 0, y: -1 };
  } else if (keyCode === 39 && direction.x === 0) {
    // Right arrow
    direction = { x: 1, y: 0 };
  } else if (keyCode === 40 && direction.y === 0) {
    // Down arrow
    direction = { x: 0, y: 1 };
  }
}

function reloadGame(event) {
  if (event.keyCode === 13) {
    window.removeEventListener('keydown', reloadGame);
    setup();
  }
}

function draw() {
  // First, draw a background
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Make sure snake and fruit exist before drawing them
  if (!snake || snake.length === 0 || !fruit) {
    console.log('Cannot draw: snake or fruit not initialized');
    return;
  }

  // Calculate the cell size based on canvas dimensions
  const cellWidth = canvas.width / columns;
  const cellHeight = canvas.height / rows;

  // Draw grid lines for better visibility
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 0.5;

  // Draw grid lines
  for (let i = 1; i < columns; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellWidth, 0);
    ctx.lineTo(i * cellWidth, canvas.height);
    ctx.stroke();
  }

  for (let i = 1; i < rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cellHeight);
    ctx.lineTo(canvas.width, i * cellHeight);
    ctx.stroke();
  }

  // Draw snake segments
  ctx.fillStyle = '#6200ea';
  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    // Use Math.floor for better Safari rendering
    const x = Math.floor(segment.x * cellWidth);
    const y = Math.floor(segment.y * cellHeight);

    // Draw with a slight gap between cells for better visibility
    ctx.fillRect(x, y, cellWidth - 1, cellHeight - 1);

    // Add a highlight to the head
    if (i === 0) {
      ctx.fillStyle = '#3700b3';
      ctx.fillRect(x + cellWidth / 4, y + cellHeight / 4, cellWidth / 2, cellHeight / 2);
      ctx.fillStyle = '#6200ea';
    }
  }

  // Draw fruit
  ctx.fillStyle = 'red';
  const fruitX = Math.floor(fruit.x * cellWidth);
  const fruitY = Math.floor(fruit.y * cellHeight);
  ctx.fillRect(fruitX, fruitY, cellWidth - 1, cellHeight - 1);

  // Add a highlight to the fruit
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(fruitX + cellWidth / 3, fruitY + cellHeight / 3, cellWidth / 3, cellHeight / 3);
}

function setBit(x, y) {
  const index = y * columns + x;
  const arrayIndex = Math.floor(index / 32);
  const bitIndex = index % 32;
  bitMask[arrayIndex] |= 1 << bitIndex;
}

function clearBit(x, y) {
  const index = y * columns + x;
  const arrayIndex = Math.floor(index / 32);
  const bitIndex = index % 32;
  bitMask[arrayIndex] &= ~(1 << bitIndex);
}

function getBit(x, y) {
  const index = y * columns + x;
  const arrayIndex = Math.floor(index / 32);
  const bitIndex = index % 32;
  return (bitMask[arrayIndex] & (1 << bitIndex)) !== 0;
}

function clearBoard() {
  bitMask.fill(0);
}

function gameOver() {
  clearInterval(gameInterval);
  window.removeEventListener('keydown', changeDirection);

  // Update high score if needed
  if (score > highScore) {
    highScore = score;
    document.getElementById('highScore').innerText = highScore;
  }

  // Use setTimeout to prevent Safari from freezing on alert
  setTimeout(() => {
    // Show game over message without blocking alert
    document.getElementById('restartGame').style.display = 'inline';
    document.getElementById('startGame').style.display = 'none';

    // Flash the scoreboard to indicate game over
    const scoreboard = document.querySelector('.scoreboard');
    scoreboard.style.backgroundColor = '#ffebee';
    setTimeout(() => {
      scoreboard.style.backgroundColor = '#f0f0f7';
    }, 500);
  }, 50);
}

function resetGame() {
  // Clear any existing game intervals
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }

  // Remove event listeners
  window.removeEventListener('keydown', changeDirection);

  // Reset UI elements
  document.getElementById('startGame').style.display = 'inline';
  document.getElementById('restartGame').style.display = 'none';

  // Reset game state
  score = 0;
  document.getElementById('score').innerText = score;
  snake = [];
  direction = { x: 0, y: 0 };

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Reset the scoreboard background color
  const scoreboard = document.querySelector('.scoreboard');
  if (scoreboard) {
    scoreboard.style.backgroundColor = '#f0f0f7';
  }
}



function game() {
  // Update position based on velocity
  posX += velocityX;
  posY += velocityY;

  if (velocityX !== 0 || velocityY !== 0) {
    gameRunning = true;
  }

  // Clear the canvas with a white background
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid lines
  const scale = canvas.width / gameSize;
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 0.5;

  for (let i = 1; i < gameSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * scale, 0);
    ctx.lineTo(i * scale, canvas.height);
    ctx.stroke();
  }

  for (let i = 1; i < gameSize; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * scale);
    ctx.lineTo(canvas.width, i * scale);
    ctx.stroke();
  }

  // Draw snake segments
  ctx.fillStyle = "#6200ea";
  path.forEach(segment => {
    ctx.fillRect(segment.x * scale, segment.y * scale, scale - 2, scale - 2);
    if (gameRunning && segment.x === posX && segment.y === posY) {
      restartGame();
      return;
    }
  });

  // Add new head position
  path.push({ x: posX, y: posY });

  // Remove tail if snake is longer than current length
  while (path.length > length) {
    path.shift();
  }

  // Get position array for AI and log it
  movementLog.push(getPositionArray());

  // Get AI prediction and process input
  processInput(computePrediction(getPositionArray()));

  // Check boundary collision
  if (posX < 0 || posX >= gameSize || posY < 0 || posY >= gameSize) {
    restartGame();
    return;
  }

  // Check if snake is stuck (hasn't eaten apple for too long)
  loopsSinceApple++;
  if (loopsSinceApple >= 75) {
    restartGame();
    return;
  }

  // Check if snake ate the apple
  if (xApple === posX && yApple === posY) {
    loopsSinceApple = 0;
    length++;
    score++;
    document.getElementById('score').innerText = score;
    placeApple();
  }

  // Update generation counter
  document.getElementById('genCount').innerText = currGen;

  ctx.fillStyle = "red";
  ctx.fillRect(xApple * scale, yApple * scale, scale - 2, scale - 2);

  document.getElementById("score").innerText = score;
  document.getElementById("genCount").innerText = currGen;

  loopsSinceApple++;
}

function placeApple() {
  xApple = Math.floor(Math.random() * columns);
  yApple = Math.floor(Math.random() * rows);
}

function processInput(input) {

  if (input == 'left') {
    if (velocityY == -1) {
      velocityX = -1;
      velocityY = 0;
    } else if (velocityY == 1) {
      velocityX = 1;
      velocityY = 0;
    } else if (velocityX == -1) {
      velocityX = 0;
      velocityY = 1;
    } else {
      velocityX = 0;
      velocityY = -1;
    }

  } else if (input == 'right') {
    if (velocityY == -1) {
      velocityX = 1;
      velocityY = 0;
    } else if (velocityY == 1) {
      velocityX = -1;
      velocityY = 0;
    } else if (velocityX == -1) {
      velocityX = 0;
      velocityY = -1;
    } else {
      velocityX = 0;
      velocityY = 1;
    }
  } else if (input == 'forward') {
    if (velocityY == 0 && velocityX == 0) {
      velocityY = -1;
    }
  }
}
function restartGame() {
  // Clear the game interval
  if (gameInterval) {
    clearInterval(gameInterval);
  }

  // Reset game state
  gameRunning = false;

  // Update high score if needed
  if (score > highScore) {
    highScore = score;
    document.getElementById("highScore").innerHTML = highScore;
  }

  // Reset snake state
  length = setTail;
  score = 0;
  document.getElementById('score').innerText = score;
  velocityX = 0;
  velocityY = 0;
  posX = 10;
  posY = 10;
  path = [];

  // Increment generation and train neural network
  currGen++;
  document.getElementById('genCount').innerText = currGen;
  trainNeuralNet(movementLog);

  // Reset game tracking variables
  loopsSinceApple = 0;
  movementLog = [];

  // Place a new apple
  placeApple();

  // Restart the game loop
  gameInterval = setInterval(game, speedDifficulty);
}

function getPositionArray() {
  var arr = [0, 0, 0];
  var relApple = [0, 0];
  if (velocityY == -1) {

    if (xApple < posX) {
      relApple[0] = -1;
    } else if (xApple == posX) {
      relApple[0] = 0;
    } else {
      relApple[0] = 1;
    }

    if (yApple < posY) {
      relApple[1] = 1;
    } else if (yApple == posY) {
      relApple[1] = 0;
    } else {
      relApple[1] = -1;
    }

    if (posX == 0) {
      arr[0] = 1;
    }
    if (posY == 0) {
      arr[1] = 1;

    }
    if (posX == gameSize - 1) {
      arr[2] = 1;
    }
    for (var i = 0; i < path.length; i++) {
      if (path[i].x == posX - 1 && path[i].y == posY) {
        arr[0] = 1;
      }
      if (path[i].x == posX && path[i].y == posY - 1) {
        arr[1] = 1;
      }
      if (path[i].x == posX + 1 && path[i].y == posY) {
        arr[2] = 1;
      }
    }

  } else if (velocityY == 1) {
    if (xApple < posX) {
      relApple[0] = 1;
    } else if (xApple == posX) {
      relApple[0] = 0;
    } else {
      relApple[0] = -1;
    }

    if (yApple < posY) {
      relApple[1] = -1;
    } else if (yApple == posY) {
      relApple[1] = 0;
    } else {
      relApple[1] = 1;
    }

    if (posX == gameSize - 1) {
      arr[0] = 1;
    }
    if (posY == gameSize - 1) {
      arr[1] = 1;
    }
    if (posX == 0) {
      arr[2] = 1;
    }
    for (var i = 0; i < path.length; i++) {

      if (path[i].x == posX + 1 && path[i].y == posY) {
        arr[0] = 1;
      }
      if (path[i].x == posX && path[i].y == posY + 1) {
        arr[1] = 1;
      }

      if (path[i].x == posX - 1 && path[i].y == posY) {
        arr[2] = 1;
      }
    }

  } else if (velocityX == -1) {

    if (xApple < posX) {
      relApple[1] = -1;
    } else if (xApple == posX) {
      relApple[1] = 0;
    } else {
      relApple[1] = 1;
    }

    if (yApple < posY) {
      relApple[0] = 1;
    } else if (yApple == posY) {
      relApple[0] = 0;
    } else {
      relApple[0] = -1;
    }

    if (posY == gameSize - 1) {
      arr[0] = 1;
    }
    if (posX == 0) {
      arr[1] = 1;
    }
    if (posY == 0) {
      arr[2] = 1;
    }
    for (var i = 0; i < path.length; i++) {

      if (path[i].x == posX && path[i].y == posY + 1) {
        arr[0] = 1;
      }

      if (path[i].x == posX - 1 && path[i].y == posY) {
        arr[1] = 1;
      }

      if (path[i].x == posX && path[i].y == posY - 1) {
        arr[2] = 1;
      }
    }
  } else if (velocityX == 1) {

    if (xApple < posX) {
      relApple[1] = 1;
    } else if (xApple == posX) {
      relApple[1] = 0;
    } else {
      relApple[1] = -1;
    }

    if (yApple < posY) {
      relApple[0] = -1;
    } else if (yApple == posY) {
      relApple[0] = 0;
    } else {
      relApple[0] = 1;
    }

    if (posY == 0) {
      arr[0] = 1;
    }
    if (posX == gameSize - 1) {
      arr[1] = 1;
    }
    if (posY == gameSize - 1) {
      arr[2] = 1;
    }


    for (var i = 0; i < path.length; i++) {

      if (path[i].x == posX && path[i].y == posY - 1) {
        arr[0] = 1;
      }

      if (path[i].x == posX + 1 && path[i].y == posY) {
        arr[1] = 1;
      }
      if (path[i].x == posX && path[i].y == posY + 1) {
        arr[2] = 1;
      }
    }
  } else {

    if (xApple < posX) {
      relApple[0] = -1;
    } else if (xApple == posX) {
      relApple[0] = 0;
    } else {
      relApple[0] = 1;
    }

    if (yApple < posY) {
      relApple[1] = -1;
    } else if (yApple == posY) {
      relApple[1] = 0;
    } else {
      relApple[1] = 1;
    }
  }

  arr.push(relApple[0]);
  arr.push(relApple[1]);


  return arr;
}

function deriveExpectedMove(arr) {

  if (arr[0] == 1 && arr[1] == 1) {
    return 2;

  } else if (arr[0] == 1 && arr[2] == 1) {
    return 1;

  } else if (arr[1] == 1 && arr[2] == 1) {
    return 0;

  } else if (arr[0] == 1 && (arr[3] == -1 || arr[3] == 0)) {

    if (arr[4] == -1) {
      return 2;
    } else {
      return 1;
    }

  } else if (arr[0] == 1 && arr[3] == 1) {
    return 2;

  } else if (arr[1] == 1 && (arr[3] = -1) || arr[3] == 0) {
    return 0;

  } else if (arr[1] == 1 && arr[3] == 1) {
    return 2;

  } else if (arr[2] == 1 && arr[3] == -1) {
    return 0;

  } else if (arr[2] == 1 && arr[3] == 0) {

    if (arr[4] == -1) {
      return 0;
    } else {
      return 1;
    }

  } else if (arr[2] == 1 && arr[3] == 1) {
    return 1;

  } else if (arr[3] == -1) {
    return 0;

  } else if (arr[3] == 0) {

    if (arr[4] == -1) {
      return 0;

    } else {
      return 1;
    }

  } else {
    return 2;
  }
}