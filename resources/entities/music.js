import { Entity, Event, EventList, Action, ActionList } from './module.js';

export default new Entity(
  'music',
  'music',
  true,
  false,
  new EventList(
    new Event.Create(
      new ActionList(
        new Action.PlaySound('self', 'music', true),
        new Action.SetAlarm('self', 0, 60)
      )
    ),
    new Event.Alarm(
      new ActionList(
        new Action.CreateInstance('self', 'bomb'),
        new Action.SetAlarm('self', 0, 60)
      )
    )
  )
);