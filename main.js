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
  Background,
  BackgroundList,
  Zone,
  ZoneList,
  Layer,
  LayerList,
} from './types/resources.js';
import Triggers from './types/triggers/module.js';
import { Position, Size, Velocity, BoundingBox } from './types/math.js';

main('fruit-clicker');

async function main(game) {
  if (!Window.this.scapp.argv.includes('--debug')) {
    Window.this.modal({ url: 'about.html' });
  }

  const { default: RESOURCES } = await import(
    `./games/${game}/resources/module.js`
  );

  Resource.GAME = game;

  RESOURCES.globals = {
    GAME: game,
    SCORE: 0,
  };

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
  //console.log('Hydrating resources ...');
  const date = Date.now();
  await Promise.all([
    ...res.sounds.map((snd) => snd.hydrate()),
    ...res.zones
      .map(({ layers }) => layers)
      .flat(1)
      .map((layer) => layer.hydrate(res)),
    ...res.sprites.map((spr) => spr.hydrate()),
    ...res.entities.map((ent) => ent.hydrate(res)),
  ]);
  //console.log(`Hydration complete! (${(Date.now() - date) / 1000} seconds)`);
}

function handleTrigger(name, res) {
  for (const unit of res.units) {
    if (res.globals.SLEEPING) break;
    const trigger = unit.entity.triggers.find(
      (trigger) => trigger.name === name
    );

    if (name === 'outside room') {
      const boundary = new BoundingBox(
        new Position(0, 0),
        res.globals.CURRENT_ZONE.size
      );
      if (!unit.position.isInside(boundary)) {
        const misc = { res };
        trigger?.call(unit, misc);
      }
    }
  }
}

async function play(res) {
  const zone = res.zones[0];
  res.globals.CURRENT_ZONE = zone;
  await loadZone(zone, res);

  const INPUT_STATE = {
    KEYBOARD: {},
    MOUSE: {
      [Triggers.Mouse.BUTTONS.LEFT]: {
        position: new Position(),
        clicked: false,
        held: false,
        released: false,
      },
    },
  };

  document.on('mousedown', 'body', (evt) => {
    const state = INPUT_STATE.MOUSE[evt.button] || {
      position: new Position(),
      clicked: false,
      held: false,
      released: false,
    };
    state.position = new Position(evt.x, evt.y);
    state.clicked = true;
    state.held = true;
  });

  document.on('mouseup', 'body', (evt) => {
    const state = INPUT_STATE.MOUSE[evt.button] || {
      position: new Position(),
      clicked: false,
      held: false,
      released: false,
    };
    state.position = new Position(evt.x, evt.y);
    state.held = false;
  });

  const tick = function () {
    //  ... update game state ...
    // ... compute location of objects ...

    // Begin Step
    for (const unit of res.units) {
      if (res.globals.SLEEPING) break;
    }

    // Step
    for (const unit of res.units) {
      if (res.globals.SLEEPING) break;
      const { triggers } = unit.entity;
      for (const trigger of triggers) {
        switch (trigger.name) {
          case 'step': {
            const misc = { res };
            trigger.call(unit, misc);
            break;
          }
        }
      }
    }

    // Outside Room
    handleTrigger('outside room', res);

    for (const unit of res.units) {
      if (res.globals.SLEEPING) break;

      const { triggers } = unit.entity;

      for (const trigger of triggers) {
        switch (trigger.name) {
          case 'create': {
            const misc = { res };
            trigger.call(unit, misc);
            break;
          }
          case 'collision': {
            const entity = res.entities.find(
              ({ name }) => name === trigger.other
            );
            const others = res.units
              .filter((other) => other.entity === entity)
              .filter((other) => other !== unit)
              .filter((other) => unit.willCollide(other));

            others.forEach((other) => {
              const misc = { res, other };
              trigger.call(unit, misc);
            });

            break;
          }
          case 'alarm': {
            const alarm = unit.getAlarm(trigger.alarm);
            if (alarm.firing) {
              const misc = { res };
              trigger.call(unit, misc);

              alarm.firing = false;
            }
            break;
          }
          case 'mouse click': {
            const state = INPUT_STATE.MOUSE[trigger.button];
            if (state.clicked) {
              const box = new BoundingBox(unit.position, unit.sprite.size);
              if (state.position.isInside(box)) {
                const misc = { res };
                trigger.call(unit, misc);
              }
            }
            break;
          }
          default: {
            break;
          }
        }
      }

      // update position
      // decrement alarms
      // advance subimage
      unit.tick();
    }

    // End Step
    for (const unit of res.units) {
      if (res.globals.SLEEPING) break;
    }

    // reset input states
    Object.values(INPUT_STATE.MOUSE).forEach(
      (state) => (state.clicked = false)
    );

    this.requestPaint();
    // request this.animate() call on next VSYNC
    if (res.globals.GAME_LOOP_RUNNING) {
      return true;
    } else {
      res.globals.LOOP_STOPPED = true;
      return false;
    }
  };

  res.globals.STOP_LOOP = async function () {
    res.globals.GAME_LOOP_RUNNING = false;
    res.globals.LOOP_STOPPED = false;
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (res.globals.LOOP_STOPPED) {
          clearInterval(interval);
          resolve();
        }
      });
    });
  };

  res.globals.RESUME_LOOP = function (FPS) {
    res.globals.GAME_LOOP_RUNNING = true;
    res.globals.LOOP_STOPPED = false;
    document.$('#zone').animate(tick, { FPS });
  };

  res.globals.RESTART = async function () {
    await res.globals.STOP_LOOP();
    res.globals.SCORE = 0;
    await loadZone(res.zones[0], res);
    res.globals.RESUME_LOOP(res.zones[0].fps);
  };

  res.globals.RESTART_CURRENT_ZONE = async function () {
    await res.globals.STOP_LOOP();
    await loadZone(res.globals.CURRENT_ZONE, res);
    res.globals.RESUME_LOOP(zone.fps);
  };

  res.globals.SLEEP = async function (milliseconds) {
    res.globals.SLEEPING = true;
    const date = Date.now();
    while (true) {
      if (Date.now() - date >= milliseconds) {
        res.globals.SLEEPING = false;
        return;
      }
    }
  };

  res.globals.GAME_LOOP_RUNNING = true;

  document.$('#zone').animate(tick, { FPS: res.globals.CURRENT_ZONE.fps });

  document.$('#zone').paintContent = function (gfx) {
    //... draw game state here ...
    if (!res.globals.GAME_LOOP_RUNNING) return;

    // draw event
    for (const unit of res.units) {
      unit.render(gfx);
    }
  };
}

async function loadZone(zone, res) {
  adjustWindow(zone.caption, zone.size);

  const [layer] = zone.layers;

  const { style } = document.$('#zone');

  style.backgroundImage = `url("games/${Resource.GAME}/resources/backgrounds/${layer.background.filename}")`;
  style.backgroundRepeat =
    layer.repeat.x && layer.repeat.y
      ? 'repeat'
      : layer.repeat.x
      ? 'repeat-x'
      : layer.repeat.y
      ? 'repeat-y'
      : 'no-repeat';

  const seconds = eval('100vh.valueOf()') / layer.speedY / 30;
  style.animation = `scrollY ${seconds}s linear infinite`;

  res.units = zone.units.map((fn) => fn());

  //console.log('Hydrating units ...');
  const date = Date.now();
  await Promise.all(res.units.map((unit) => unit.hydrate(res)));
  //console.log(`Hydration complete! (${(Date.now() - date) / 1000} seconds)`);
}
