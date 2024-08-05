/* Snake level here is as simple as canvas that fills entire avilable screen space. */
class SnakeLevel extends Level {
  beginPlay(game) {
    this.width = game.renderer.canvas.width;
    this.height = game.renderer.canvas.height;

    this.addActors(
      new ABackgroundActor(),
      new APickupsActor(),
      new ASnakeActor()
    );

    game.renderer.onResizeEvents.push(
      function (renderer) {
        this.width = renderer.canvas.width;
        this.height = renderer.canvas.height;
      }.bind(this)
    );

    super.beginPlay(game);
  }

  randomCell() {
    const { cellSize } = this.getGameOptions();
    if (!cellSize) {
      throw new Error('Cell size is not defined.');
    }

    const { width, height } = this;
    if (!width || !height) {
      throw new Error('Width or height is not defined.');
    }

    let x = Math.random() * width;
    let y = Math.random() * height;

    if (x >= canvas.width) x -= width * 0.5;
    else if (x < 0) x += width * 0.5;
    if (y >= height) y -= height * 0.5;
    else if (y < 0) y += height * 0.5;

    x = Math.floor(x / cellSize) * cellSize;
    y = Math.floor(y / cellSize) * cellSize;

    return new Vector(x, y);
  }
}
