import { SoundList } from '../module.js';
export { Sound } from '../module.js';

import click from './click.js';
import explode from './explode.js';
import music from './music.js';

export default new SoundList(
  click,
  explode,
  music,
);
