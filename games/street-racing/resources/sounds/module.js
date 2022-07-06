import { SoundList } from '../module.js';
export { Sound } from '../module.js';

import background_music from './background_music.js';
import collision from './collision.js';
import gas_sound from './gas_sound.js';
import horn from './horn.js';
import sirens from './sirens.js';

export default new SoundList(
  background_music,
  collision,
  gas_sound,
  horn,
  sirens
);
