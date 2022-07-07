import { Trigger } from './trigger.js';

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

export class OutsideRoom extends Trigger {
  constructor(actions) {
    super('outside room', actions);
  }
}
