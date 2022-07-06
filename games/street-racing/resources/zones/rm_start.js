import {
  Zone,
  Layer,
  LayerList,
  Unit,
  UnitList,
  Size,
  Position,
} from './module.js';

export default new Zone(
  'rm_start',
  'Street Racing',
  new Size(640, 480),
  40,
  new LayerList(
    new Layer(
      'background0',
      'rgb(192, 192, 192)',
      { x: false, y: true },
      false,
      0,
      3
    )
  ),
  new UnitList(
    () => new Unit('controller', new Position(0, 0)),
    () => new Unit('car_down', new Position(80, 128)),
    () => new Unit('car_racing', new Position(220, 272)),
    () => new Unit('car_up', new Position(280, 224))
  )
);
