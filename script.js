const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// settings
let cellSize = 20;
let snakeSpeed = 3;
let speedStep = 1; // the amount of speed increase when eating a pickup
let snakeColor = '#bbff00';
let headColor = '#00ff00';
let pickupColor = '#ff55cc';
let backgroundColor = '#663300';
let pickupsCount = 10;
let startingSnakeLength = 4;
let isPaused = false;

// state
const snake = [];
let snakeDirection;
let newDirection;
const pickups = [];

const up = { x: 0, y: -1 };
const down = { x: 0, y: 1 };
const left = { x: -1, y: 0 };
const right = { x: 1, y: 0 };

const randomDirection = () => {
  const directions = [up, down, left, right];
  const randomIndex = Math.floor(Math.random() * directions.length);

  return directions[randomIndex];
};

const randomCell = () => {
  let x = Math.random() * canvas.width;
  let y = Math.random() * canvas.height;

  // if its out of screen add or substract half of the width or height
  if (x >= canvas.width) x -= canvas.width * 0.5;
  else if (x < 0) x += canvas.width * 0.5;
  if (y >= canvas.height) y -= canvas.height * 0.5;
  else if (y < 0) y += canvas.height * 0.5;

  x = Math.floor(x / cellSize) * cellSize;
  y = Math.floor(y / cellSize) * cellSize;

  return { x, y };
};

const fillRectangle = (x, y, width, height, color) => {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.fillRect(x, y, width, height);
};

const strokeSquare = (x, y, size, color, strokeWidth = 1) => {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.strokeRect(x, y, size, size);
};

const fillSquare = (x, y, size, color) => {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.fillRect(x, y, size, size);
};

const pressedKeys = {};
document.addEventListener('keydown', (event) => {
  pressedKeys[event.code] = true;
});
document.addEventListener('keyup', (event) => {
  pressedKeys[event.code] = false;
});

// init game

const startCell = randomCell();
snakeDirection = randomDirection();

for (let i = 0; i < startingSnakeLength; i++) {
  snake.push({
    x: startCell.x - snakeDirection.x * i * cellSize,
    y: startCell.y - snakeDirection.y * i * cellSize,
  });
}

for (let i = 0; i < pickupsCount; i++) {
  pickups.push(randomCell());
}

let lastTime = performance.now();
let timeSinceLastUpdate = 0;
fillSquare(0, 0, canvas.width, canvas.height, backgroundColor);

const update = () => {
  const now = performance.now();
  // check input and disallow going in the opposite direction
  if (pressedKeys.ArrowUp) {
    newDirection = up;
    console.log('up');
  } //
  else if (pressedKeys.ArrowDown) {
    newDirection = down;
    console.log('down');
  } //
  else if (pressedKeys.ArrowLeft) {
    newDirection = left;
    console.log('left');
  } //
  else if (pressedKeys.ArrowRight) {
    newDirection = right;
    console.log('right');
  }

  if (pressedKeys.Space) {
    oldPaused = isPaused;
    isPaused = !isPaused;
    if (oldPaused && !isPaused) {
      // if unpaused reset lastTime to avoid a big deltaTime
      lastTime = now;
      timeSinceLastUpdate = 0;
    }
    pressedKeys.Space = undefined;
    console.log('space');
  }

  const currentTime = now;
  const deltaTime = (currentTime - lastTime) / 1000;
  timeSinceLastUpdate += deltaTime;

  const shouldUpdate = timeSinceLastUpdate >= 1 / snakeSpeed;
  if (!shouldUpdate || isPaused) {
    lastTime = currentTime;
    requestAnimationFrame(update);
    return;
  }

  timeSinceLastUpdate -= 1 / snakeSpeed;

  if (
    newDirection &&
    newDirection.x != snakeDirection.x &&
    newDirection.y != snakeDirection.y
  ) {
    snakeDirection = newDirection;
  }

  const head = snake[0];
  const tail = snake.pop();
  const futureHead = {
    x: head.x + snakeDirection.x * cellSize,
    y: head.y + snakeDirection.y * cellSize,
  };

  // if the future head goes off the screen teleport it to the other side
  if (futureHead.x < 0) futureHead.x = canvas.width - (canvas.width % cellSize);
  else if (futureHead.x >= canvas.width) futureHead.x = 0;
  if (futureHead.y < 0)
    futureHead.y = canvas.height - (canvas.height % cellSize);
  else if (futureHead.y >= canvas.height) futureHead.y = 0;

  // check if snake head is on its body
  const isDead = snake.some(
    (cell, index) =>
      index !== 0 && cell.x === futureHead.x && cell.y === futureHead.y
  );

  if (isDead) {
    alert(
      `You have died. Your score is ${snake.length - startingSnakeLength + 1}.`
    );
    location.reload();
    return;
  }

  // move tail into future head
  snake.unshift(futureHead);

  // check if snake head is on a pickup
  const pickupIndex = pickups.findIndex(
    (pickup) => pickup.x === futureHead.x && pickup.y === futureHead.y
  );
  if (pickupIndex !== -1) {
    pickups.splice(pickupIndex, 1); // remove that pickup from the map
    snake.push(tail); // grow the snake
    pickups.push(randomCell()); // create new random pickup
    snakeSpeed += speedStep; // increase snake speed
  }

  fillRectangle(0, 0, canvas.width, canvas.height, backgroundColor);

  pickups.forEach((pickup) => {
    fillSquare(pickup.x, pickup.y, cellSize, pickupColor);
    strokeSquare(pickup.x, pickup.y, cellSize, backgroundColor);
  });
  snake.forEach((cell) => {
    fillSquare(cell.x, cell.y, cellSize, snakeColor);
    strokeSquare(cell.x, cell.y, cellSize, backgroundColor);
  });
  fillSquare(snake[0].x, snake[0].y, cellSize, headColor);
  strokeSquare(snake[0].x, snake[0].y, cellSize, backgroundColor);

  lastTime = currentTime;
  requestAnimationFrame(update);
};

update();
