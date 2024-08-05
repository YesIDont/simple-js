class SnakeInput extends SimpleKeyboardInput {
  constructor() {
    super();
  }

  tick(deltaSeconds, tickState) {
    super.tick(deltaSeconds, tickState);

    const { pressedKeys } = this;
    const options = this.getGameOptions();

    if (pressedKeys.Space) {
      options.isPaused = !options.isPaused;
      if (!options.isPaused) {
        // if unpaused reset lastTime to avoid a big deltaTime
        tickState.lastTime = performance.now();
        // console.log('resume');
      }
      pressedKeys.Space = undefined;
      if (options.isPaused) {
        // console.log('paused');
        return;
      }
    }

    const currentLevel = this.getCurrentLevel();
    const snakeActor = currentLevel.getActorByName('Snake');

    if (pressedKeys.ArrowUp) {
      snakeActor.newDirection = snakeActor.up;
      // console.log('up');
    } //
    else if (pressedKeys.ArrowDown) {
      snakeActor.newDirection = snakeActor.down;
      // console.log('down');
    } //
    else if (pressedKeys.ArrowLeft) {
      snakeActor.newDirection = snakeActor.left;
      // console.log('left');
    } //
    else if (pressedKeys.ArrowRight) {
      snakeActor.newDirection = snakeActor.right;
      // console.log('right');
    }
  }
}
