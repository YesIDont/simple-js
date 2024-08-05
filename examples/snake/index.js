window.addEventListener('load', () => {
  const level = new SnakeLevel();
  const options = new SnakeOptions();
  const input = new SnakeInput();
  const game = new Game(options);

  game.addLevel(level, true);
  game.addInput(input);
  game.start();
});
