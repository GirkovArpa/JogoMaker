import { Entity, Event, EventList, Action, ActionList } from './module.js';

export default new Entity(
  'banana',
  'banana',
  true,
  false,
  new EventList(
    new Event.Create(
      new ActionList(new Action.Move('self', [45, 135, 225, 315], 12, false))
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
