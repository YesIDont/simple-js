class ASnakeActor extends AActor {
  up = new Vector(0, -1);
  down = new Vector(0, 1);
  left = new Vector(-1, 0);
  right = new Vector(1, 0);

  directions = [];
  body = []; // Vectors/cells that make up the snake body
  snakeDirection = new Vector();
  newDirection = undefined;
  timeSinceLastUpdate = 0;

  pickupsActorRef = undefined;

  constructor() {
    super();
    this.name = 'Snake';
    this.canTick = true;
  }

  randomDirection() {
    const randomIndex = Math.floor(Math.random() * this.directions.length);

    return this.directions[randomIndex];
  }

  beginPlay(deltaSeconds, tickState) {
    super.beginPlay(deltaSeconds, tickState);

    const { cellSize, startingSnakeLength } = this.getGameOptions();
    const startCell = this.getCurrentLevel().randomCell();

    this.directions = [this.up, this.down, this.left, this.right];
    const snakeDirection = this.randomDirection();

    for (let i = 0; i < startingSnakeLength; i++) {
      this.body.push({
        x: startCell.x - snakeDirection.x * i * cellSize,
        y: startCell.y - snakeDirection.y * i * cellSize,
      });
    }

    this.snakeDirection = snakeDirection;
    this.pickupsActorRef = this.getCurrentLevel().getActorByName('Pickups');

    const game = this.getGame();
    const resetTimeSinceLastUpdate = function () {
      this.timeSinceLastUpdate = 0;
    }.bind(this);

    game.onResumeEvents.push(resetTimeSinceLastUpdate);
  }

  tick(deltaSeconds, tickState) {
    this.timeSinceLastUpdate += deltaSeconds;

    const shouldUpdate =
      this.timeSinceLastUpdate >= 1 / this.getGameOptions().snakeSpeed;

    if (!shouldUpdate) {
      return;
    }

    this.timeSinceLastUpdate -= 1 / this.getGameOptions().snakeSpeed;

    super.tick(deltaSeconds, tickState);

    const { body, newDirection } = this;
    const options = this.getGameOptions();
    const { cellSize } = options;

    if (
      newDirection &&
      newDirection.x != this.snakeDirection.x &&
      newDirection.y != this.snakeDirection.y
    ) {
      this.snakeDirection = newDirection;
    }

    const head = body[0];
    const tail = body.pop();
    const futureHead = {
      x: head.x + this.snakeDirection.x * cellSize,
      y: head.y + this.snakeDirection.y * cellSize,
    };

    // if the future head goes off the screen teleport it to the other side
    if (futureHead.x < 0)
      futureHead.x = canvas.width - (canvas.width % cellSize);
    else if (futureHead.x >= canvas.width) futureHead.x = 0;
    if (futureHead.y < 0)
      futureHead.y = canvas.height - (canvas.height % cellSize);
    else if (futureHead.y >= canvas.height) futureHead.y = 0;

    // check if snake head is on its body
    const isDead = this.body.some(
      (cell, index) =>
        index !== 0 && cell.x === futureHead.x && cell.y === futureHead.y
    );

    if (isDead) {
      alert(
        `You have died. Your score is ${
          body.length - options.startingSnakeLength + 1
        }.`
      );
      location.reload();
      return;
    }

    // move tail into future head
    body.unshift(futureHead);

    // check if snake head is on a pickup
    const { pickups } = this.pickupsActorRef;
    const pickupIndex = pickups.findIndex(
      (pickup) => pickup.x === futureHead.x && pickup.y === futureHead.y
    );

    if (pickupIndex !== -1) {
      pickups.splice(pickupIndex, 1); // remove that pickup from the map
      body.push(tail); // grow the snake
      pickups.push(this.getCurrentLevel().randomCell()); // create new random pickup
      this.getGameOptions().increaseSpeed();
    }
  }

  render(renderer) {
    const { body } = this;

    const { cellSize, headColor, snakeColor, backgroundColor } =
      this.getGameOptions();

    body.forEach((cell, i) => {
      if (i === 0) return;
      renderer.fillRectangle(cell.x, cell.y, cellSize, cellSize, snakeColor);
    });

    const { x, y } = body[0];
    renderer.fillSquare(x, y, cellSize, headColor);
  }
}
