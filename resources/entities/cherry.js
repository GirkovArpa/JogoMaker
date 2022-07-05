import { Entity, Trigger, TriggerList, Action, ActionList } from './module.js';

export default new Entity(
  'cherry',
  'cherry',
  true,
  false,
  new TriggerList(
    new Trigger.Create(
      new ActionList(new Action.Move('self', [90, 180, 270, 360], 16, false))
    ),
    new Trigger.Collision(new ActionList(new Action.Bounce()), 'wall'),
    new Trigger.Mouse.Click(
      new ActionList(
        new Action.JumpRandom(),
        new Action.SetScore('self', 100, true),
        new Action.PlaySound('self', 'click', false)
      ),
      Trigger.Mouse.LEFT
    )
  )
);
