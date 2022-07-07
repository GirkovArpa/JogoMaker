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
    if (action instanceof Action || action instanceof ActionList) {
      super.push(action);
    } else {
      throw new Error(
        `Neither an Action nor an ActionList: ${JSON.stringify(action)}`
      );
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

    const { x: unitX, y: unitY } = unit.position;
    const { speedX, speedY } = unit;
    const { x: otherX, y: otherY } = other.position;

    if (
      ((otherX > unitX && speedX > 0) || (otherX < unitX && speedX < 0)) &&
      unit.wouldCollide(new Position(unitX + speedX, unitY), other)
    ) {
      unit.speedX = -speedX;
    }
    if (
      ((otherY > unitY && speedY > 0) || (otherY < unitY && speedY < 0)) &&
      unit.wouldCollide(new Position(unitX, unitY + speedY), other)
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

class JumpToPosition extends Action {
  constructor(executor = 'self', position = new Position(), relative = false) {
    super('jump to position', executor);
    this.position = position;
    this.relative = relative;
  }

  perform(unit, misc) {
    super.perform(unit, misc);

    const newX = this.position.x + (this.relative ? unit.position.x : 0);
    const newY = this.position.y + (this.relative ? unit.position.y : 0);
    const newPos = new Position(newX, newY);
    unit.position = newPos;
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
      `games/${misc.res.globals.GAME}/resources/sounds/${filename}`
    );
    audio.name = this.sound;
    await unit.playAudio(audio);
  }
}

class StopSound extends Action {
  constructor(executor = 'self', sound) {
    super('stop sound', executor);
    this.sound = sound;
  }

  perform(unit, misc) {
    super.perform(unit, misc);

    misc.units.forEach((u) => u.stopSound(this.sound));
  }
}

class CheckSound extends Action {
  constructor(executor = 'self', sound, not = false) {
    super('check sound', executor);
    this.sound = sound;
    this.not = not;
  }

  perform(unit, misc) {
    super.perform(unit, misc);

    return misc.units.some((u) => u.isSoundPlaying(this.sound));
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

    for (const u of [...misc.res.units]) {
      u.dele(misc.res);
    }

    await misc.res.globals.RESTART();
  }
}

class RestartCurrentZone extends Action {
  constructor(executor = 'self') {
    super('restart current zone', executor);
  }

  async perform(unit, misc) {
    super.perform(unit, misc);

    for (const u of [...misc.res.units]) {
      if (!u.entity.persistent) {
        u.dele(misc.res);
      }
    }

    await misc.res.globals.RESTART_CURRENT_ZONE();
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

class SetVariable extends Action {
  constructor(executor = 'self', variable, value = 0, relative = false) {
    super('set variable', executor);
    this.variable = variable;
    this.value = value;
    this.relative = relative;
  }

  perform(unit, misc) {
    super.perform(unit, misc);

    const value = unit.sandboxedEval(this.value);
    const js = `${this.variable} ${this.relative ? '+' : ''}= ${value}`;
    unit.sandboxedEval(js);
  }
}

class SpeedVertical extends Action {
  constructor(executor = 'self', speedY = 0) {
    super('speed vertical', executor);
    this.speedY = speedY;
  }

  perform(unit, misc) {
    super.perform(unit, misc);
    unit.speedY = this.speedY;
  }
}

class TestExpression extends Action {
  constructor(executor = 'self', expression) {
    super('test expression', executor);
  }

  perform(unit, misc) {
    super.perform(unit, misc);
    const boolean = unit.evaluateExpression(this.expression, misc.not);
    return boolean;
  }
}

class ExitTrigger extends Action {
  constructor(executor = 'self') {
    super('exit trigger', executor);
  }
}

class ChangeSprite extends Action {
  constructor(executor = 'self', sprite, subimage = 0, speed = 1) {
    super('change sprite', executor);
    this.sprite = sprite;
    this.subimage = subimage;
    this.speed = speed;
  }

  perform(unit, misc) {
    super.perform(unit, misc);

    unit.sprite = misc.res.sprites.find(({ name }) => name === this.sprite);
    unit.subimage =
      typeof this.subimage === 'string'
        ? unit.sandboxedEval(this.subimage)
        : this.subimage;

    unit.imageSpeed = this.speed;
  }
}

class DestroyUnit extends Action {
  constructor(executor = 'self') {
    super('destroy unit', executor);
  }

  perform(unit, misc) {
    if (executor === 'self') {
      unit.destroy();
    } else if (executor === 'other') {
      misc.other.destroy();
    } else {
      misc.res.units.find(({ name }) => name === executor).destroy();
    }
  }
}

class SetLives extends Action {
  constructor(executor = 'self', value, relative = false) {
    super('destroy unit', executor);
  }

  perform(unit, misc) {
    super.perform(unit, misc);

    Unit.setGlobal('lives', this.value, relative);
  }
}

class TestChance extends Action {
  constructor(executor = 'self', sides = 2, not = false) {
    super('test chance', executor);
    this.sides = sides;
    this.not = not;
  }

  perform(unit, misc) {
    super.perform(unit, misc);

    const bool = ~~(Math.random() * this.sides) === 0;
    const result = this.not ? !bool : bool;
    return result;
  }
}

class CheckEntity extends Action {
  constructor(
    executor = 'self',
    entity,
    position = new Position(),
    relative = false,
    not = false
  ) {
    super('check entity', executor);
    this.entity = entity;
    this.position = position;
    this.relative = relative;
    this.not = not;
  }

  perform(unit, misc) {
    super.perform(unit, misc);

    const position = this.relative
      ? new Position(
          unit.position.x + this.position.x,
          unit.position.y + this.position.y
        )
      : position;
    const others = misc.res.units.filter(({ name }) => name === this.entity);

    return others.some((other) => {
      const box = new BoundingBox(other.position, other.sprite?.size);
      return position.isInside(box);
    });
  }
}

export default {
  Move,
  Bounce,
  JumpRandom,
  JumpToPosition,
  SetScore,
  PlaySound,
  SetAlarm,
  CreateUnit,
  Sleep,
  Restart,
  SetVariable,
  SpeedVertical,
  TestExpression,
  ExitTrigger,
  ChangeSprite,
  DestroyUnit,
  CheckSound,
  StopSound,
  SetLives,
  RestartCurrentZone,
  TestChance,
  CheckEntity,
};
