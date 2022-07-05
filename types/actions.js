import { Position } from './math.js';

export class Action {
  constructor(name, executor = 'self') {
    this.name = name;
    this.executor = executor;
  }

  perform(instance, other = null) {
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

  perform(instance) {
    super.perform(instance);
    const direction = this.directions[
      ~~(Math.random() * this.directions.length)
    ];
    if (direction === null) {
      instance.speed = 0;
      return;
    } else {
      instance.direction = direction;
      instance.speed = this.speed + (this.relative ? instance.speed : 0);
    }
  }
}

class Bounce extends Action {
  constructor(executor = 'self', precise = false, solid = true) {
    super('bounce', executor);
    this.precise = precise;
    this.solid = solid;
  }

  perform(instance, other) {
    super.perform(instance, other);

    const { x: instX, y: instY } = instance.position;
    const { speedX, speedY } = instance;
    const { x: otherX, y: otherY } = other.position;

    if (
      ((otherX > instX && speedX > 0) || (otherX < instX && speedX < 0)) &&
      instance.wouldCollide(new Position(instX + speedX, instY), other)
    ) {
      instance.speedX = -speedX;
    }
    if (
      ((otherY > instY && speedY > 0) || (otherY < instY && speedY < 0)) &&
      instance.wouldCollide(new Position(instX, instY + speedY), other)
    ) {
      instance.speedY = -speedY;
    }
  }
}

class JumpRandom extends Action {
  constructor(executor = 'self', snap = { x: 0, y: 0 }) {
    super('jump random', executor);
    this.snap = snap;
  }
}

class SetScore extends Action {
  constructor(executor = 'self', score = 0, relative = false) {
    super('set score', executor);
    this.score = score;
    this.relative = relative;
  }
}

class PlaySound extends Action {
  constructor(executor = 'self', sound, loop = false) {
    super('play sound', executor);
    this.sound = sound;
    this.loop = loop;
  }
}

class SetAlarm extends Action {
  constructor(executor = 'self', alarm = 0, ticks = 60, relative = false) {
    super('set alarm', executor);
    this.ticks = ticks;
    this.relative = false;
  }
}

class CreateInstance extends Action {
  constructor(executor = 'self', object, position = new Position()) {
    super('create instance', executor);
    this.object = object;
    this.position = position;
  }
}

class Restart extends Action {
  constructor(executor = 'self') {
    super('restart', executor);
  }
}

class Sleep extends Action {
  constructor(executor = 'self', milliseconds = 1000, redraw = true) {
    super('sleep', executor);
    this.milliseconds = milliseconds;
    this.redraw = redraw;
  }
}

export default {
  Move,
  Bounce,
  JumpRandom,
  SetScore,
  PlaySound,
  SetAlarm,
  CreateInstance,
  Sleep,
  Restart,
};
