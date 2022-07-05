export {
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
  Unit,
  UnitList,
} from '../types/resources.js';
export { default as Trigger, TriggerList } from '../types/triggers.js';
export { default as Action, ActionList } from '../types/actions.js';
export { Size, Position } from '../types/math.js';

import { default as entities } from './entities/module.js';
import { default as sounds } from './sounds/module.js';
import { default as sprites } from './sprites/module.js';
import { default as wallpapers } from './wallpapers/module.js';
import { default as zones } from './zones/module.js';

export default {
  entities,
  sounds,
  sprites,
  wallpapers,
  zones,
};
