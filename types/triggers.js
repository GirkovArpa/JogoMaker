import Action from './actions.js';

export class Trigger {
  constructor(name, actions) {
    this.name = name;
    this.actions = actions;
  }

  async call(unit, misc) {
    for (let i = 0; i < this.actions.length; i++) {
      if (!misc.res.globals.GAME_LOOP_RUNNING) {
        break;
      }
      const action = this.actions[i];
      if (action instanceof Action.ExitTrigger) {
        break;
      }
      const result = await action.perform(unit, misc);
      if (action instanceof Action.TestExpression) {
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

export class Create extends Trigger {
  constructor(actions) {
    super('create', actions);
  }

  call(unit, misc) {
    if (!unit.created) {
      super.call(unit, misc);
      unit.created = true;
    }
  }
}

export class Collision extends Trigger {
  constructor(actions, other) {
    super('collision', actions);
    this.other = other;
  }

  call(unit, misc) {
    super.call(unit, misc);
  }
}

export class Alarm extends Trigger {
  constructor(actions, alarm = 0) {
    super('alarm', actions);
    this.alarm = alarm;
  }
}

export class Step extends Trigger {
  constructor(actions) {
    super('step', actions);
  }

  call(unit, misc) {
    super.call(unit, misc);
  }
}

export class Mouse extends Trigger {
  constructor(name, actions, button = 1) {
    super(name, actions);
    this.button = button;
  }

  call(unit, misc) {
    super.call(unit, misc);
  }

  static get LEFT() {
    return 1;
  }

  static get RIGHT() {
    return 2;
  }

  static get MIDDLE() {
    return 3;
  }
}

export class Click extends Mouse {
  constructor(actions, button = Mouse.LEFT) {
    super('mouse click', actions, button);
  }
}

export class Hold extends Mouse {
  constructor(actions, button = Mouse.LEFT) {
    super('mouse hold', actions, button);
  }
}

export class Release extends Mouse {
  constructor(actions, button = Mouse.LEFT) {
    super('mouse release', actions, button);
  }
}

export default {
  Alarm,
  Create,
  Collision,
  Step,
  Mouse: {
    LEFT: Mouse.LEFT,
    RIGHT: Mouse.RIGHT,
    MIDDLE: Mouse.MIDDLE,
    Click,
    Hold,
    Release,
  },
};
