import { EntityList } from '../module.js';
export { Entity, EntityList, Event, EventList, Action, ActionList } from '../module.js';

import apple from './apple.js';
import banana from './banana.js';
import bomb from './bomb.js';
import cherry from './cherry.js';
import music from './music.js';
import strawberry from './strawberry.js';
import wall from './wall.js';

export default new EntityList(
  apple,
  banana,
  bomb,
  cherry,
  music,
  strawberry,
  wall,
);
