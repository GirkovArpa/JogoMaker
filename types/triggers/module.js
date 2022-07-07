import { Trigger, TriggerList } from './trigger.js';
import Keyboard from './keyboard.js';
import Mouse from './mouse.js';
import { Create, Collision, Alarm, Step, OutsideRoom } from './misc.js';

export default {
  Keyboard,
  Mouse,
  Create,
  Collision,
  Alarm,
  Step,
  OutsideRoom,
};

export const TriggerList = TriggerList;
