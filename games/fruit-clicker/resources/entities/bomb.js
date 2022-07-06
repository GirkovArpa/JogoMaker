import { Entity, Trigger, TriggerList, Action, ActionList } from './module.js';

export default new Entity(
  'bomb',
  'bomb',
  true,
  false,
  new TriggerList(
    new Trigger.Create(new ActionList(new Action.JumpRandom())),
    new Trigger.Mouse.Click(
      new ActionList(
        new Action.PlaySound('self', 'explode', false),
        new Action.Sleep('self', 1000, true),
        new Action.Restart()
      ),
      Trigger.Mouse.LEFT
    )
  )
);
