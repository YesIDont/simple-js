class APickupsActor extends AActor {
  pickups = [];

  constructor() {
    super();
    this.name = 'Pickups';
  }

  beginPlay(deltaSeconds, tickState) {
    super.beginPlay(deltaSeconds, tickState);

    const { pickupsCount } = this.getGameOptions();
    if (!pickupsCount) {
      throw new Error('Pickups count is not defined.');
    }

    for (let i = 0; i < pickupsCount; i++) {
      this.pickups.push(this.getCurrentLevel().randomCell());
    }
  }

  render(renderer) {
    const { cellSize, pickupColor, backgroundColor } = this.getGameOptions();

    this.pickups.forEach((pickup) => {
      renderer.fillSquare(pickup.x, pickup.y, cellSize, pickupColor);
      renderer.strokeSquare(pickup.x, pickup.y, cellSize, backgroundColor);
    });
  }
}
