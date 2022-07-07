import { Entity, Trigger, TriggerList, Action, ActionList } from './module.js';

export default new Entity(
  'apple',
  'apple',
  true,
  false,
  new TriggerList(
    new Trigger.Create(
      new ActionList(
        new Action.Move(
          'self',
          [45, 90, 135, 180, 225, 270, 315, 360],
          8,
          false
        )
      )
    ),
    new Trigger.Collision(new ActionList(new Action.Bounce()), 'wall'),
    new Trigger.Mouse.Click(
      new ActionList(
        new Action.JumpRandom(),
        new Action.SetScore('self', 50, true),
        new Action.PlaySound('self', 'click', false)
      ),
      Trigger.Mouse.BUTTONS.LEFT
    )
  )
);
