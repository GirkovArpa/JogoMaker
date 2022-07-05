import { Entity, Event, EventList, Action, ActionList } from './module.js';

export default new Entity(
  'bomb',
  'bomb',
  true,
  false,
  new EventList(
    new Event.Create(new ActionList(new Action.JumpRandom())),
    new Event.Mouse.Click(
      new ActionList(
        new Action.PlaySound('self', 'explode', false),
        new Action.Sleep('self', 1000, true),
        new Action.Restart()
      ),
      1
    )
  )
);
