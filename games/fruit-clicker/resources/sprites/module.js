import { SpriteList } from '../module.js';
export { Sprite, Size } from '../module.js';

import apple from './apple.js';
import banana from './banana.js';
import bomb from './bomb.js';
import cherry from './cherry.js';
import strawberry from './strawberry.js';
import wall from './wall.js';

export default new SpriteList(
  apple,
  banana,
  bomb,
  cherry,
  strawberry,
  wall,
);
