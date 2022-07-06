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
  'room0',
  '',
  new Size(640, 480),
  30,
  new LayerList(new Layer('wood', 'rgb(192, 192, 192)', { x: true, y: true })),
  new UnitList(
    () => new Unit('music', new Position(32, 32)),

    () => new Unit('apple', new Position(128, 128)),
    () => new Unit('apple', new Position(320, 352)),

    () => new Unit('cherry', new Position(64, 192)),
    () => new Unit('cherry', new Position(256, 64)),
    () => new Unit('cherry', new Position(416, 288)),

    () => new Unit('banana', new Position(448, 64)),
    () => new Unit('banana', new Position(224, 320)),

    () => new Unit('strawberry', new Position(320, 128)),
    () => new Unit('strawberry', new Position(512, 320)),

    () => new Unit('bomb', new Position(160, 256)),
    () => new Unit('bomb', new Position(448, 160)),

    ...Array.from({ length: 20 }, (_, i) => () =>
      new Unit('wall', new Position(i * 32, 0))
    ),
    ...Array.from({ length: 20 }, (_, i) => () =>
      new Unit('wall', new Position(i * 32, 448))
    ),
    ...Array.from({ length: 13 }, (_, i) => () =>
      new Unit('wall', new Position(0, 32 + i * 32))
    ),
    ...Array.from({ length: 13 }, (_, i) => () =>
      new Unit('wall', new Position(608, 32 + i * 32))
    )
  )
);
