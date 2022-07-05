import { Action } from './actions.js';

export class Event {
  constructor(name, actions) {
    this.name = name;
    this.actions = actions;
  }

  call(instance, other = null) {
    this.actions.forEach((act) => act.perform(instance, other));
  }
}

export class EventList extends Array {
  push(event) {
    if (event instanceof Event) {
      super.push(event);
    } else {
      throw new Error(`Not an Event: ${JSON.stringify(event)}`);
    }
  }
}

export class Create extends Event {
  constructor(actions) {
    super('create', actions);
  }

  call(instance) {
    if (!instance.created) {
      super.call(instance);
      instance.created = true;
    }
  }
}

export class Collision extends Event {
  constructor(actions, other) {
    super('collision', actions);
    this.other = other;
  }

  call(instance, other) {
    super.call(instance, other);
  }
}

export class Alarm extends Event {
  constructor(actions, alarm = 0) {
    super('alarm', actions);
    this.alarm = alarm;
  }
}

export class Mouse extends Event {
  constructor(name, actions, button = 1) {
    super(name, actions);
    this.button = button;
  }
}

export class Click extends Mouse {
  constructor(actions, button = 1) {
    super('mouse click', actions, button);
  }
}

export class Hold extends Mouse {
  constructor(actions, button = 1) {
    super('mouse hold', actions, button);
  }
}

export class Release extends Mouse {
  constructor(actions, button = 1) {
    super('mouse release', actions, button);
  }
}

export default {
  Alarm,
  Create,
  Collision,
  Mouse: {
    Click,
    Hold,
    Release,
  },
};
