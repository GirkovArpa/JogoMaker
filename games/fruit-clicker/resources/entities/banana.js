import { Entity, Trigger, TriggerList, Action, ActionList } from './module.js';

export default new Entity(
  'banana',
  'banana',
  true,
  false,
  new TriggerList(
    new Trigger.Create(
      new ActionList(new Action.Move('self', [45, 135, 225, 315], 12, false))
    ),
    new Trigger.Collision(new ActionList(new Action.Bounce()), 'wall'),
    new Trigger.Mouse.Click(
      new ActionList(
        new Action.JumpRandom(),
        new Action.SetScore('self', 100, true),
        new Action.PlaySound('self', 'click', false)
      ),
      Trigger.Mouse.BUTTONS.LEFT
    )
  )
);
