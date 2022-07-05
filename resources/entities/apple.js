import { Entity, Event, EventList, Action, ActionList } from './module.js';

export default new Entity(
  'apple',
  'apple',
  true,
  false,
  new EventList(
    new Event.Create(
      new ActionList(
        new Action.Move(
          'self',
          [45, 90, 135, 180, 225, 270, 315, 360],
          8,
          false
        )
      )
    ),
    new Event.Collision(new ActionList(new Action.Bounce()), 'wall'),
    new Event.Mouse.Click(
      new ActionList(
        new Action.JumpRandom(),
        new Action.SetScore('self', 50, true),
        new Action.PlaySound('self', 'click', false)
      ),
      1
    )
  )
);
