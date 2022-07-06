import { Position, Size, BoundingBox } from './math.js';
import { Unit } from './resources.js';

export class Action {
  constructor(name, executor = 'self') {
    this.name = name;
    this.executor = executor;
  }

  perform(unit, misc = null) {
    // do smth ...
  }
}

export class ActionList extends Array {
  push(action) {
    if (action instanceof Action) {
      super.push(action);
    } else {
      throw new Error(`Not an Action: ${JSON.stringify(action)}`);
    }
  }
}

class Move extends Action {
  constructor(
    executor = 'self',
    directions = [null],
    speed = 0,
    relative = false
  ) {
    super('move', executor);
    this.directions = directions;
    this.speed = speed;
    this.relative = relative;
  }

  perform(unit) {
    super.perform(unit);

    const direction = this.directions[
      ~~(Math.random() * this.directions.length)
    ];
    if (direction === null) {
      unit.speed = 0;
      return;
    } else {
      unit.direction = direction;
      unit.speed = this.speed + (this.relative ? unit.speed : 0);
    }
  }
}

class Bounce extends Action {
  constructor(executor = 'self', precise = false, solid = true) {
    super('bounce', executor);
    this.precise = precise;
    this.solid = solid;
  }

  perform(unit, misc) {
    super.perform(unit, misc);

    const { other } = misc;

    const { x: instX, y: instY } = unit.position;
    const { speedX, speedY } = unit;
    const { x: otherX, y: otherY } = other.position;

    if (
      ((otherX > instX && speedX > 0) || (otherX < instX && speedX < 0)) &&
      unit.wouldCollide(new Position(instX + speedX, instY), other)
    ) {
      unit.speedX = -speedX;
    }
    if (
      ((otherY > instY && speedY > 0) || (otherY < instY && speedY < 0)) &&
      unit.wouldCollide(new Position(instX, instY + speedY), other)
    ) {
      unit.speedY = -speedY;
    }
  }
}

class JumpRandom extends Action {
  constructor(executor = 'self', snap = { x: 0, y: 0 }) {
    super('jump random', executor);
    this.snap = snap;
  }

  perform(unit, misc) {
    super.perform(unit, misc);

    const { res } = misc;
    const solids = res.units
      .filter(({ solid }) => solid)
      .filter((x) => x !== unit);

    // eval bc vscode doesnt know vw and vh are legit units
    const vw = eval('100vw').valueOf();
    const vh = eval('100vh').valueOf();
    const box = new BoundingBox(new Position(0, 0), new Size(vw, vh));

    const randomSpot = () =>
      new Position(Math.random() * box.width, Math.random() * box.height);

    let position = randomSpot();

    const spotAvailable = () =>
      !solids.some((solid) => unit.wouldCollide(position, solid));

    while (!spotAvailable()) {
      position = new Position(
        Math.random() * box.x2 - box.x1,
        Math.random() * box.y2 - box.y1
      );
    }

    unit.position = position;
  }
}

class SetScore extends Action {
  constructor(executor = 'self', score = 0, relative = false) {
    super('set score', executor);
    this.score = score;
    this.relative = relative;
  }

  perform(unit, misc) {
    super.perform(unit, misc);

    misc.res.globals.SCORE =
      this.score + (this.relative ? misc.res.globals.SCORE : 0);
    Window.this.caption = `Score: ${misc.res.globals.SCORE}`;
  }
}

class PlaySound extends Action {
  constructor(executor = 'self', sound, loop = false) {
    super('play sound', executor);
    this.sound = sound;
    this.loop = loop;
  }

  async perform(unit, misc) {
    super.perform(unit, misc);

    const { filename } = misc.res.sounds.find(
      ({ name }) => name === this.sound
    );

    const audio = await Audio.load(
      `games/fruit-clicker/resources/sounds/${filename}`
    );
    await unit.playAudio(audio);
  }
}

class SetAlarm extends Action {
  constructor(executor = 'self', alarm = 0, ticks = 60, relative = false) {
    super('set alarm', executor);
    this.alarm = alarm;
    this.ticks = ticks;
    this.relative = false;
  }

  perform(unit, misc) {
    super.perform(unit, misc);

    unit.setAlarm(
      this.alarm,
      this.ticks + (this.relative ? unit.getAlarm(this.alarm.ticks) : 0)
    );
  }
}

class CreateUnit extends Action {
  constructor(executor = 'self', entity, position = new Position()) {
    super('create unit', executor);
    this.entity = entity;
    this.position = position;
  }

  async perform(unit, misc) {
    super.perform(unit, misc);

    const { res } = misc;

    const u = new Unit(this.entity, this.position);
    res.units.push(u);
    await u.hydrate(res.entities);
  }
}

class Restart extends Action {
  constructor(executor = 'self') {
    super('restart', executor);
  }

  async perform(unit, misc) {
    super.perform(unit, misc);

    console.log('Restart');
    for (const u of [...misc.res.units]) {
      u.destroy(misc.res);
    }

    await misc.res.globals.RESTART();
  }
}

class Sleep extends Action {
  constructor(executor = 'self', milliseconds = 1000, redraw = true) {
    super('sleep', executor);
    this.milliseconds = milliseconds;
    this.redraw = redraw;
  }

  async perform(unit, misc) {
    super.perform(unit, misc);

    console.log('SLEEPING');
    await misc.res.globals.SLEEP(this.milliseconds);
    console.log('AWAKE');
  }
}

export default {
  Move,
  Bounce,
  JumpRandom,
  SetScore,
  PlaySound,
  SetAlarm,
  CreateUnit,
  Sleep,
  Restart,
};
