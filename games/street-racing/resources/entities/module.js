import { EntityList } from '../module.js';
export {
  Entity,
  EntityList,
  Trigger,
  TriggerList,
  Action,
  ActionList,
  Position,
} from '../module.js';

import car_racing from './car_racing.js';
import car_down from './car_down.js';/*
import car_up from './car_up.js';
import police from './police.js';
import gas from './gas.js';
import controller from './controller.js';
import controller_start from './controller_start.js';*/

export default new EntityList(
  car_racing,
  car_down,/*
  car_up,
  police,
  gas,
  controller,
  controller_start*/
);
