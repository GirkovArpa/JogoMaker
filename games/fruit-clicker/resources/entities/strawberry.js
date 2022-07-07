import { Entity, Trigger, TriggerList, Action, ActionList } from './module.js';

export default new Entity(
  'strawberry',
  'strawberry',
  true,
  false,
  new TriggerList(
    new Trigger.Create(
      new ActionList(new Action.Move('self', [45, 135, 225, 315], 6, false))
    ),
    new Trigger.Collision(new ActionList(new Action.Bounce()), 'wall'),
    new Trigger.Mouse.Click(
      new ActionList(
        new Action.JumpRandom(),
        new Action.SetScore('self', 30, true),
        new Action.PlaySound('self', 'click', false)
      ),
      Trigger.Mouse.BUTTONS.LEFT
    )
  )
);
