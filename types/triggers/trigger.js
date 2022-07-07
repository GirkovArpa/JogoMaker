import { default as Action, ActionList } from '../actions.js';

export class Trigger {
  constructor(name, actions) {
    this.name = name;
    this.actions = actions;
  }

  call(unit, misc, actions = this.actions) {
    Trigger.call(unit, misc, actions);
  }

  static async call(unit, misc, list = this.actions) {
    for (let i = 0; i < list.length; i++) {
      if (!misc.res.globals.GAME_LOOP_RUNNING) {
        break;
      }
      const action = list[i];
      if (action instanceof ActionList) {
        await Trigger.call(unit, misc, action);
        continue;
      }
      if (action instanceof Action.ExitTrigger) {
        break;
      }
      const result = await action.perform(unit, misc);
      if (
        action instanceof Action.TestExpression ||
        action instanceof Action.TestChance ||
        action instanceof Action.CheckEntity
      ) {
        if (!result) {
          // skip the next action
          i++;
        }
      }
    }
  }
}

export class TriggerList extends Array {
  push(trigger) {
    if (trigger instanceof Trigger) {
      super.push(trigger);
    } else {
      throw new Error(`Not an Trigger: ${JSON.stringify(trigger)}`);
    }
  }
}
