import { EventList } from './events.js';
import { Velocity, Position, Size, BoundingBox } from './math.js';

export class Resource {
  constructor(name) {
    this.name = name;
  }

  async hydrate(resourceList = null) {
    if (this instanceof Layer) {
      const wallpapers = resourceList;
      this.wallpaper = wallpapers.find(({ name }) => name === this.wallpaper);
    } else if (this instanceof Sound) {
      this.audio = await Audio.load(`resources/sounds/${this.filename}`);
    } else if (this instanceof Sprite) {
      this.image = await Graphics.Image.load(
        `resources/sprites/${this.filename}`
      );
    } else if (this instanceof Entity) {
      const sprites = resourceList;
      this.sprite = sprites.find(({ name }) => name === this.sprite);
    } else if (this instanceof Instance) {
      const entities = resourceList;
      this.entity = entities.find(({ name }) => name === this.entity);
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
      throw new Error(`Not instance of Resource: ${JSON.stringify(resource)}`);
    }
  }
}

export class Wallpaper extends Resource {
  constructor(name, filename, size = new Size()) {
    super(name);
    this.filename = filename;
    this.size = size;
  }

  async hydrate() {
    await super.hydrate();
  }
}

export class WallpaperList extends ResourceList {
  push(wallpaper) {
    if (wallpaper instanceof Wallpaper) {
      super.push(wallpaper);
    } else {
      throw new Error(
        `Not instance of Wallpaper: ${JSON.stringify(wallpaper)}`
      );
    }
  }
}

export class Entity extends Resource {
  constructor(
    name,
    sprite,
    visible = true,
    solid = false,
    events = new EventList()
  ) {
    super(name);
    this.sprite = sprite;
    this.visible = visible;
    this.solid = solid;
    this.events = events;
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
      throw new Error(`Not instance of Entity: ${JSON.stringify(entity)}`);
    }
  }
}

export class Sprite extends Resource {
  constructor(name, filename, size = new Size()) {
    super(name);
    this.filename = filename;
    this.size = size;
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
      throw new Error(`Not instance of Sprite: ${JSON.stringify(sprite)}`);
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
      throw new Error(`Not instance of Sound: ${JSON.stringify(sound)}`);
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
    instances = new InstanceList()
  ) {
    super(name);
    this.caption = caption;
    this.size = size;
    this.fps = fps;
    this.layers = layers;
    this.instances = instances;
  }
}

export class ZoneList extends ResourceList {
  push(zone) {
    if (zone instanceof Zone) {
      super.push(zone);
    } else {
      throw new Error(`Not instance of Zone: ${JSON.stringify(zone)}`);
    }
  }
}

export class Layer extends Resource {
  #velocity;

  constructor(
    wallpaper = null,
    color = 'white',
    repeat = { x: false, y: false },
    stretch = false,
    speedX = 0,
    speedY = 0
  ) {
    super('');
    this.wallpaper = wallpaper;
    this.color = color;
    this.repeat = repeat;
    this.stretch = stretch;

    this.#velocity = new Velocity();
    this.#velocity.speedX = speedX;
    this.#velocity.speedY = speedY;
  }

  async hydrate(wallpapers) {
    await super.hydrate(wallpapers);
  }
}

export class LayerList extends ResourceList {
  push(layer) {
    if (layer instanceof Layer) {
      super.push(layer);
    } else {
      throw new Error(`Not instance of Layer: ${JSON.stringify(layer)}`);
    }
  }
}

export class Instance extends Resource {
  #position;
  #velocity;
  #alarms;

  #image;

  constructor(entity, position = new Position()) {
    super('');

    this.entity = entity;
    this.visible = this.entity.visible;
    this.solid = this.entity.solid;

    const { x, y } = position;

    this.#position = {
      last: new Position(x, y),
      now: new Position(x, y),
      next: new Position(x, y),
    };

    this.#velocity = new Velocity();
    this.#alarms = new AlarmList();

    this.created = false;
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

  render(gfx) {
    if (this.visible && this.#image !== null) {
      gfx.draw(this.#image, {
        ...this.position,
      });
    }
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
  }

  tick() {
    if (this.#ticks !== -1) {
      this.#ticks--;
    }
  }

  set(ticks) {
    this.#ticks = ticks;
  }

  get id() {
    return this.#id;
  }
}

export class AlarmList extends Array {
  constructor(length = 12) {
    super(length);
    this.fill((_, id) => new Alarm(id));
  }

  push(alarm) {
    if (alarm instanceof Alarm) {
      super.push(alarm);
    } else {
      throw new Error(`Not instance of Alarm: ${JSON.stringify(alarm)}`);
    }
  }
}

export class InstanceList extends ResourceList {
  push(instance) {
    if (instance instanceof Instance) {
      super.push(instance);
    } else {
      throw new Error(`Not instance of Instance: ${JSON.stringify(instance)}`);
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
  Wallpaper,
  WallpaperList,
  Zone,
  ZoneList,
  Layer,
  LayerList,
  Alarm,
  AlarmList,
};
