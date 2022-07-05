export {
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
  Instance,
  InstanceList,
} from '../types/resources.js';
export { default as Event, EventList } from '../types/events.js';
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
