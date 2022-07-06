import { Entity, Trigger, TriggerList, Action, ActionList } from './module.js';

export default new Entity(
  'car_racing',
  'car_racing',
  true,
  false,
  new TriggerList(
    new Trigger.Create(
      new ActionList(
        new Action.SetVariable('self', 'dead', false),
        new Action.SpeedVertical('self', 0)
      )
    ),
    new Trigger.Step(
      new ActionList(
        new Action.TestExpression('self', 'dead'),
        new Action.ExitTrigger('self'),
        new Action.TestExpression('self', 'global.petrol <= 0'),
        new Action.SpeedVertical('self', 3),
        new Action.SetVariable('self', 'global.petrol', -1, true)
      )
    )
  )
);
