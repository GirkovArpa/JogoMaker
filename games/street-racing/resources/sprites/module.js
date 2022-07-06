import { SpriteList } from '../module.js';
export { Sprite, Size } from '../module.js';

import car_down_dead from './car_down_dead.js';
import car_down from './car_down.js';
import car_up_dead from './car_up_dead.js';
import car_up from './car_up.js';
import gas from './gas.js';
import police_dead from './police_dead.js';
import police from './police.js';
import racing from './racing.js';
import racing_dead from './racing_dead.js';

export default new SpriteList(
  car_down_dead,
  car_down,
  car_up_dead,
  car_up,
  gas,
  police_dead,
  police,
  racing,
  racing_dead
);
