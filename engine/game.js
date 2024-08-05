class Utilities {
  static uuidv4() {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
      (
        +c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
      ).toString(16)
    );
  }
}

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

class Renderer {
  // override this method to add custom logic
}

class Canvas2dRenderer extends Renderer {
  onResizeEvents = [];

  constructor() {
    super();

    const canvas = document.createElement('canvas');
    if (!canvas) {
      throw new Error('Canvas could not be created.');
    }
    canvas.id = 'canvas';
    this.canvas = canvas;

    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Canvas context could not be created.');
    }

    document.body.appendChild(this.canvas);

    this.onResize();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  fillRectangle(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  strokeSquare(x, y, size, color, strokeWidth = 1) {
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = strokeWidth;
    this.ctx.strokeRect(x, y, size, size);
  }

  fillSquare(x, y, size, color) {
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.fillRect(x, y, size, size);
  }

  onResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.onResizeEvents.forEach((event) => {
      event(this);
    });
  }
}

class GameOptions {
  isPaused = false;
  targetFps = 60;
}

class TickState {
  lastTime = 0;
}

class AActor {
  gameRef = undefined;
  canTick = false;
  canBeRendered = false;
  name = 'Actor';

  constructor() {
    this.id = Utilities.uuidv4();
  }

  // override this method to add custom logic
  beginPlay(deltaSeconds, tickState) {
    //
  }

  // perform custom logic in this method
  tick(deltaSeconds, tickState) {
    //
  }

  // Base actor class doesn't define render logic, override this method to add custom rendering
  render(renderer) {
    //
  }

  getGame() {
    return this.gameRef;
  }

  getGameOptions() {
    return this.gameRef.options;
  }

  getCurrentLevel() {
    return this.gameRef.currentLevel;
  }
}

class Level {
  gameRef = undefined;
  actors = [];
  tickableActors = [];
  timeSinceLevelStart = 0;

  // override this method to add custom logic
  beginPlay(game) {
    this.gameRef = game;

    this.actors.forEach((actor) => {
      actor.gameRef = game;
      actor.beginPlay(0, game.tickState);
      if (actor.canTick) {
        this.tickableActors.push(actor);
      }
    });
  }

  addActor(actor) {
    this.actors.push(actor);
  }

  addActors(...actors) {
    actors.forEach((actor) => {
      this.addActor(actor);
    });
  }

  getActorById(id) {
    return this.actors.find((actor) => actor.id === id);
  }

  getActorByName(name) {
    return this.actors.find((actor) => actor.name === name);
  }

  getGameOptions() {
    return this.gameRef.options;
  }
}

class Input {
  gameRef = undefined;

  tick(deltaSeconds, tickState) {
    //
  }

  getGame() {
    return this.gameRef;
  }

  getGameOptions() {
    return this.gameRef.options;
  }

  getCurrentLevel() {
    return this.gameRef.currentLevel;
  }
}

class SimpleKeyboardInput extends Input {
  pressedKeys = {};
  onPressCallbacks = {};
  onReleaseCallbacks = {};
  tickCallback = undefined;

  gameRef = undefined;

  constructor() {
    super();

    document.addEventListener('keydown', (event) => {
      this.pressedKeys[event.code] = true;
      if (this.onPressCallbacks[event.code]) {
        this.onPressCallbacks[event.code]();
      }
    });

    document.addEventListener('keyup', (event) => {
      this.pressedKeys[event.code] = false;
      if (this.onReleaseCallbacks[event.code]) {
        this.onReleaseCallbacks[event.code]();
      }
    });
  }

  tick(deltaSeconds, tickState) {
    if (this.tickCallback) {
      this.tickCallback(deltaSeconds, tickState);
    }
  }
}

class Game {
  tickState = new TickState();
  options = undefined;
  renderer = undefined;
  inputs = [];

  onPauseEvents = [];
  onResumeEvents = [];

  levels = [];
  startLevel = undefined;
  currentLevel = undefined;

  constructor(options = new GameOptions(), renderer = new Canvas2dRenderer()) {
    this.options = options;
    this.renderer = renderer;
  }

  pause() {
    this.options.isPaused = true;
    this.onPauseEvents.forEach((event) => {
      event(this);
    });
  }

  resume() {
    this.tickState.lastTime = performance.now();
    this.options.isPaused = false;
    this.onResumeEvents.forEach((event) => {
      event(this);
    });
  }

  addLevel(level, isStartLevel) {
    this.levels.push(level);
    if (isStartLevel) {
      this.startLevel = level;
    }
  }

  addInput(input) {
    this.inputs.push(input);
  }

  tickLoop() {
    const { options, tickState, currentLevel } = this;

    const currentTime = performance.now();
    const deltaSeconds = (currentTime - tickState.lastTime) / 1000;
    currentLevel.timeSinceLevelStart += deltaSeconds;

    this.inputs.forEach((input) => {
      input.tick(deltaSeconds, tickState);
    });

    const shouldBreak = options.isPaused;

    if (shouldBreak) {
      tickState.lastTime = currentTime;
      setTimeout(this.tickLoop.bind(this), this.options.targetFps);
      return;
    }

    currentLevel.tickableActors.forEach((actor) => {
      actor.tick(deltaSeconds, tickState);
    });

    tickState.lastTime = currentTime;
    setTimeout(this.tickLoop.bind(this), this.options.targetFps);
  }

  renderLoop() {
    this.currentLevel.actors.forEach((actor) => {
      actor.render(this.renderer);
    });
    requestAnimationFrame(this.renderLoop.bind(this));
  }

  start() {
    if (this.inputs.length < 1) {
      throw new Error('No input was defined.');
    }

    this.inputs.forEach((input) => {
      input.gameRef = this;
    });

    if (!this.startLevel) {
      throw new Error('Start level was not defined.');
    }

    if (this.levels.length < 1 || !this.levels[0]) {
      throw new Error('No playable levels were defined.');
    }

    this.currentLevel = this.startLevel || this.levels[0];
    this.currentLevel.beginPlay(this);

    window.removeEventListener('blur', this.pause.bind(this));
    window.addEventListener('blur', this.pause.bind(this));

    window.removeEventListener('focus', this.resume.bind(this));
    window.addEventListener('focus', this.resume.bind(this));
    // console.log({ ...this });
    this.tickState.lastTime = performance.now();
    this.tickLoop();
    this.renderLoop();
  }
}
