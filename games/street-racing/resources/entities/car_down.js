import {
  Entity,
  Trigger,
  TriggerList,
  Action,
  ActionList,
  Position,
} from './module.js';

export default new Entity(
  'car_down',
  'car_down',
  true,
  false,
  new TriggerList(
    new Trigger.Create(
      new ActionList(
        new Action.SetVariable('self', 'this.dead', false),
        new Action.ChangeSprite('self', 'car_down', 'Math.random() * 4', 0),
        new Action.JumpToPosition('self', new Position(44 + 120, -80)),
        new Action.SpeedVertical('self', 6),
        new Action.TestChance('self', 2), 
        new ActionList(
          new Action.JumpToPosition('self', new Position(44 + 60, -80)),
          new Action.SpeedVertical('self', 5),
          new Action.TestChance('self', 3),
          new ActionList(
            new Action.JumpToPosition('self', new Position(44, -80)),
            new Action.SpeedVertical('self', 4)
          )
        ),
        new Action.CheckEntity('self', 'car_down', new Position(0, 0), true),
        new Action.DestroyUnit('self')
      )
    )
  )
);
