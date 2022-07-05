import { Entity, Event, EventList, Action, ActionList } from './module.js';

export default new Entity(
  'cherry',
  'cherry',
  true,
  false,
  new EventList(
    new Event.Create(
      new ActionList(new Action.Move('self', [90, 180, 270, 360], 16, false))
    ),
    new Event.Collision(new ActionList(new Action.Bounce()), 'wall'),
    new Event.Mouse.Click(
      new ActionList(
        new Action.JumpRandom(),
        new Action.SetScore('self', 100, true),
        new Action.PlaySound('self', 'click', false)
      ),
      1
    )
  )
);
