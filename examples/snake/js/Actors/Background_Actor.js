class ABackgroundActor extends AActor {
  constructor() {
    super();
    this.name = 'Background';
    this.canBeRendered = true;
  }

  beginPlay(deltaSeconds, tickState) {
    super.beginPlay(deltaSeconds, tickState);

    const { backgroundColor } = this.getGameOptions();
    this.backgroundColor = backgroundColor;
  }

  render(renderer) {
    const { width, height } = this.getCurrentLevel();
    if (!width || !height) {
      throw new Error('Width or height is not defined.');
    }

    renderer.fillRectangle(0, 0, width, height, this.backgroundColor);
  }
}
