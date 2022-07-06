import { Entity, Trigger, TriggerList, Action, ActionList } from './module.js';

export default new Entity(
  'car_racing',
  'car_racing',
  true,
  false,
  new TriggerList(
    new Trigger.Create(
      new ActionList(
        new Action.SetVariable()
      )
    )
  )
);
