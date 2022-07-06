import { Entity, Trigger, TriggerList, Action, ActionList } from './module.js';

export default new Entity(
  'music',
  'music',
  true,
  false,
  new TriggerList(
    new Trigger.Create(
      new ActionList(
        new Action.PlaySound('self', 'music', true),
        new Action.SetAlarm('self', 0, 60)
      )
    ),
    new Trigger.Alarm(
      new ActionList(
        new Action.CreateUnit('self', 'bomb'),
        new Action.SetAlarm('self', 0, 60)
      )
    )
  )
);