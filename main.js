import { $, $$, decode } from '@sciter';
import { fs } from '@sys';
import {
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
} from './types/resources.js';
import Events from './types/events.js';
import { Position, Size, Velocity, BoundingBox } from './types/math.js';
import RESOURCES from './resources/module.js';

main();

async function main() {
  Window.this.modal({ url: 'about.html' });

  const [{ caption, size }] = RESOURCES.zones;
  adjustWindow(caption, size);

  await hydrateResources(RESOURCES);
  await play(RESOURCES);
}

function adjustWindow(caption = '', size = new Size()) {
  Window.this.caption = caption;
  const [w, h] = Window.this.screenBox('frame', 'dimension');
  const x = w / 2 - size.width / 2;
  const y = h / 2 - size.height / 2;
  Window.this.move(x, y, size.width, size.height, true);
}

async function hydrateResources(res) {
  console.log('Hydrating resources ...');
  await Promise.all([
    ...res.sounds.map((snd) => snd.hydrate()),
    ...res.zones
      .map(({ layers }) => layers)
      .flat(1)
      .map((layer) => layer.hydrate(res.wallpapers)),
    ...res.sprites.map((spr) => spr.hydrate()),
    ...res.entities.map((ent) => ent.hydrate(res.sprites)),
  ]);
  console.log('Hydration complete!');
}

async function play(res) {
  const zone = res.zones[0];
  await loadZone(zone, res);

  const tick = function () {
    //  ... update game state ...
    // ... compute location of objects ...

    res.instances.forEach((inst) => {
      const { events } = inst.entity;

      events.forEach((evt) => {
        switch (evt.name) {
          case 'create': {
            evt.call(inst);
            break;
          }
          case 'collision': {
            const entity = res.entities.find(({ name }) => name === evt.other);
            const others = res.instances
              .filter((other) => other.entity === entity)
              .filter((other) => other !== inst)
              .filter((other) => inst.willCollide(other));

            others.forEach((other) => {
              evt.call(inst, other);
            });

            break;
          }
          default: {
            break;
          }
        }
      });

      inst.step();
    });

    // request this.paintContent() call
    this.requestPaint();
    // request this.animate() call on next VSYNC
    return true;
  };

  document.$('#zone').animate(tick, { FPS: zone.fps });

  document.$('#zone').paintContent = function (gfx) {
    //... draw game state here ...
    res.instances.forEach((inst) => {
      inst.render(gfx);
    });
  };
}

async function loadZone(zone, res) {
  adjustWindow(zone.caption, zone.size);

  const [layer] = zone.layers;

  const {
    body: { style },
  } = document;

  style.backgroundImage = `url("resources/wallpapers/${layer.wallpaper.filename}")`;
  style.backgroundRepeat =
    layer.repeat.x && layer.repeat.y
      ? 'repeat'
      : layer.repeat.x
      ? 'repeat-x'
      : layer.repeat.y
      ? 'repeat-y'
      : 'no-repeat';

  res.instances = zone.instances;

  console.log('Hydrating instances ...');
  await Promise.all(res.instances.map((inst) => inst.hydrate(res.entities)));
  console.log('Hydration complete!');
}
