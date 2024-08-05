class SnakeOptions extends GameOptions {
  cellSize = 20;
  snakeSpeed = 3;
  speedStep = 1;
  snakeColor = '#ccff11';
  headColor = '#00ff00';
  pickupColor = '#ff55cc';
  backgroundColor = '#663300';
  pickupsCount = 10;
  startingSnakeLength = 4;

  constructor() {
    super();
    this.targetFps = this.snakeSpeed;
  }

  increaseSpeed() {
    this.snakeSpeed += this.speedStep;
    this.targetFps = this.snakeSpeed;
  }
}
