import { TriggerList } from './triggers/module.js';
import { Velocity, Position, Size, BoundingBox } from './math.js';
import sandboxedEval from '../utils/sandboxed-eval.js';

export class Resource {
  constructor(name) {
    this.name = name;
  }

  static GAME = null;

  async hydrate(res, misc = null) {
    if (this instanceof Layer) {
      this.background = res.backgrounds.find(
        ({ name }) => name === this.background
      );
    } else if (this instanceof Sound) {
      this.audio = await Audio.load(
        `games/${Resource.GAME}/resources/sounds/${this.filename}`
      );
      this.audio.name = this.name;
    } else if (this instanceof Sprite) {
      this.image = await Graphics.Image.load(
        `games/${Resource.GAME}/resources/sprites/${this.filename}`
      );
    } else if (this instanceof Entity) {
      this.sprite = res.sprites.find(({ name }) => name === this.sprite) || null;
    } else if (this instanceof Unit) {
      this.entity = res.entities.find(({ name }) => name === this.entity);
      this.sprite = this.entity.sprite || null;
      this.visible = this.entity.visible;
      this.solid = this.entity.solid;
    }
  }
}

export class ResourceList extends Array {
  push(resource) {
    if (resource instanceof Resource) {
      super.push(resource);
    } else {
      throw new Error(`Not unit of Resource: ${JSON.stringify(resource)}`);
    }
  }

  remove(resource) {
    this.splice(this.indexOf(resource), 1);
  }
}

export class Background extends Resource {
  constructor(name, filename, size = new Size()) {
    super(name);
    this.filename = filename;
    this.size = size;
  }

  async hydrate() {
    await super.hydrate();
  }
}

export class BackgroundList extends ResourceList {
  push(background) {
    if (background instanceof Background) {
      super.push(background);
    } else {
      throw new Error(`Not unit of Background: ${JSON.stringify(background)}`);
    }
  }
}

export class Entity extends Resource {
  constructor(
    name,
    sprite,
    visible = true,
    solid = false,
    triggers = new TriggerList(),
    persistent = false
  ) {
    super(name);
    this.sprite = sprite;
    this.visible = visible;
    this.solid = solid;
    this.triggers = triggers;
    this.persistent = persistent;
  }

  async hydrate(sprites) {
    await super.hydrate(sprites);
  }
}

export class EntityList extends ResourceList {
  push(entity) {
    if (entity instanceof Entity) {
      super.push(entity);
    } else {
      throw new Error(`Not unit of Entity: ${JSON.stringify(entity)}`);
    }
  }
}

export class Sprite extends Resource {
  constructor(name, filename, size = new Size(), subimages = 1) {
    super(name);
    this.filename = filename;
    this.size = size;
    this.subimages = subimages;
  }

  async hydrate() {
    await super.hydrate();
  }
}

export class SpriteList extends ResourceList {
  push(sprite) {
    if (sprite instanceof Sprite) {
      super.push(sprite);
    } else {
      throw new Error(`Not unit of Sprite: ${JSON.stringify(sprite)}`);
    }
  }
}

export class Sound extends Resource {
  constructor(name, filename) {
    super(name);
    this.filename = filename;
  }

  async hydrate() {
    await super.hydrate();
  }
}

export class SoundList extends ResourceList {
  push(sound) {
    if (sound instanceof Sound) {
      super.push(sound);
    } else {
      throw new Error(`Not unit of Sound: ${JSON.stringify(sound)}`);
    }
  }
}

export class Zone extends Resource {
  constructor(
    name,
    caption = '',
    size = new Size(),
    fps = 30,
    layers = new LayerList(),
    units = new UnitList()
  ) {
    super(name);
    this.caption = caption;
    this.size = size;
    this.fps = fps;
    this.layers = layers;
    this.units = units;
  }
}

export class ZoneList extends ResourceList {
  push(zone) {
    if (zone instanceof Zone) {
      super.push(zone);
    } else {
      throw new Error(`Not unit of Zone: ${JSON.stringify(zone)}`);
    }
  }
}

export class Layer extends Resource {
  #velocity;

  constructor(
    background = null,
    color = 'white',
    repeat = { x: false, y: false },
    stretch = false,
    speedX = 0,
    speedY = 0
  ) {
    super('');
    this.background = background;
    this.color = color;
    this.repeat = repeat;
    this.stretch = stretch;

    this.#velocity = new Velocity();
    this.#velocity.speedX = speedX;
    this.#velocity.speedY = speedY;
  }

  async hydrate(backgrounds) {
    await super.hydrate(backgrounds);
  }

  get speedX() {
    return this.#velocity.speedX;
  }

  get speedY() {
    return this.#velocity.speedY;
  }
}

export class LayerList extends ResourceList {
  push(layer) {
    if (layer instanceof Layer) {
      super.push(layer);
    } else {
      throw new Error(`Not unit of Layer: ${JSON.stringify(layer)}`);
    }
  }
}

export class Unit extends Resource {
  #position;
  #velocity;
  #alarms;

  #image;
  #audios;

  #local;

  #subimage;

  constructor(entity, position = new Position()) {
    super('');

    this.entity = entity;
    this.visible = this.entity.visible;
    this.solid = this.entity.solid;
    this.imageSpeed = 1;

    const { x, y } = position;

    this.#position = {
      last: new Position(x, y),
      now: new Position(x, y),
      next: new Position(x, y),
    };

    this.#velocity = new Velocity();
    this.#alarms = new AlarmList();
    this.#audios = [];
    this.#local = {};

    this.#subimage = 0;

    this.created = false;
    this.destroy = false;
  }

  static #global = {};

  get global() {
    return Unit.#global;
  }

  static setGlobal(name, value, relative = false) {
    if (relative) {
      Unit.#global[name] = Unit.#global[name] + value;
    } else {
      Unit.#global[name] = value;
    }
  }

  get local() {
    return this.#local;
  }

  sandboxedEval(js = '') {
    return sandboxedEval(js, this.global, this.local);
  }

  evaluateExpression(expression, not = false) {
    const boolean = this.sandboxedEval(expression);
    return not ? !boolean : Boolean(boolean);
  }

  dele(res) {
    this.#audios.forEach((audio) => audio.stop());
    res.units.remove(this);
  }

  destroy() {
    // flag for destroying
    this.destroy = true;
  }

  async playAudio(audio) {
    this.#audios.push(audio);
    await audio.play();
    this.#audios.splice(this.#audios.indexOf(audio), 1);
  }

  isSoundPlaying(sound) {
    return this.#audios.some(
      (audio) => audio.name === sound && audio.progress > 0
    );
  }

  stopSound(sound) {
    this.#audios
      .filter(({ name }) => name === sound)
      .forEach((audio) => audio.stop());
  }

  async hydrate(entities) {
    await super.hydrate(entities);
    this.#image = this.sprite?.image || null;
  }

  isColliding(other) {
    const myBox = new BoundingBox(this.position, this.sprite?.size);
    const theirBox = new BoundingBox(other.position, other.sprite?.size);
    return myBox.isColliding(theirBox);
  }

  willCollide(other) {
    const myBox = new BoundingBox(this.positionNext, this.sprite?.size);
    const theirBox = new BoundingBox(other.positionNext, other.sprite?.size);
    return myBox.isColliding(theirBox);
  }

  wouldCollide(position = new Position(), other) {
    const myBox = new BoundingBox(position, this.sprite?.size);
    const theirBox = new BoundingBox(other.positionNext, other.sprite?.size);
    return myBox.isColliding(theirBox);
  }

  get subimage() {
    return this.#subimage % this.entity.sprite.subimages;
  }

  set subimage(n) {
    this.#subimage = n;
  }

  render(gfx) {
    if (this.visible && this.#image !== null) {
      const { sprite } = this.entity;
      gfx.draw(this.#image, {
        x: this.position.x,
        y: this.position.y,
        srcWidth: sprite.size.width,
        srcHeight: sprite.size.height,
        srcX: sprite.size.width * Math.floor(this.subimage),
        srcY: 0,
        width: sprite.size.width,
        height: sprite.size.height,
      });
    }
  }

  tick() {
    if (this.entity.sprite !== null) {
      this.subimage += this.imageSpeed;
    }
    this.#alarms.forEach((alarm) => alarm.tick());
    this.step();
  }

  step() {
    const { x, y } = this.positionNext;
    this.position = new Position(x, y);
  }

  get position() {
    return this.positionNow;
  }

  get positionNow() {
    const { x, y } = this.#position.now;
    return new Position(x, y);
  }

  set position(position) {
    this.#position.last = this.#position.now;
    const { x, y } = position;
    this.#position.now = new Position(x, y);
    this.#position.next = new Position(x + this.speedX, y + this.speedY);
  }

  set positionNow(position) {
    this.position = position;
  }

  get positionLast() {
    const { x, y } = this.#position.last;
    return new Position(x, y);
  }

  get positionNext() {
    const { x, y } = this.#position.next;
    return new Position(x, y);
  }

  get speed() {
    return this.#velocity.speed;
  }

  set speed(n) {
    this.#velocity.speed = n;
  }

  get direction() {
    return this.#velocity.direction;
  }

  set direction(degrees) {
    this.#velocity.direction = degrees;
  }

  get speedX() {
    return this.#velocity.speedX;
  }

  set speedX(n) {
    this.#velocity.speedX = n;
  }

  get speedY() {
    return this.#velocity.speedY;
  }

  set speedY(n) {
    this.#velocity.speedY = n;
  }

  getAlarm(id) {
    return this.#alarms.find((alarm) => alarm.id === id);
  }

  setAlarm(id, ticks) {
    this.#alarms.find((alarm) => alarm.id === id).set(ticks);
  }
}

export class Alarm {
  #id;
  #ticks;

  constructor(id, ticks = 0) {
    this.#id = id;
    this.#ticks = ticks;
    this.firing = false;
  }

  tick() {
    if (this.#ticks !== -1) {
      this.#ticks--;
      if (this.#ticks === -1) {
        this.firing = true;
      }
    }
  }

  set(ticks) {
    this.#ticks = ticks;
  }

  get id() {
    return this.#id;
  }

  get ticks() {
    return this.#ticks;
  }
}

export class AlarmList extends Array {
  constructor(length = 12) {
    super(length);

    for (let id = 0; id < length; id++) {
      this[id] = new Alarm(id);
    }
  }

  push(alarm) {
    if (alarm instanceof Alarm) {
      super.push(alarm);
    } else {
      throw new Error(`Not unit of Alarm: ${JSON.stringify(alarm)}`);
    }
  }
}

export class UnitList extends ResourceList {
  push(unit) {
    if (unit instanceof Unit) {
      super.push(unit);
    } else {
      throw new Error(`Not unit of Unit: ${JSON.stringify(unit)}`);
    }
  }
}

export default {
  Resource,
  ResourceList,
  Entity,
  EntityList,
  Sound,
  SoundList,
  Sprite,
  SpriteList,
  Background,
  BackgroundList,
  Zone,
  ZoneList,
  Layer,
  LayerList,
  Alarm,
  AlarmList,
};
