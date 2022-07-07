import { Trigger } from './trigger.js';

export default class Mouse extends Trigger {
  constructor(name, actions, button) {
    super(name, actions);
    this.button = button;
  }

  call(unit, misc) {
    super.call(unit, misc);
  }

  static BUTTONS = {
    LEFT: 1,
    RIGHT: 2,
    MIDDLE: 3,
  };
}

class Click extends Mouse {
  constructor(actions, button) {
    super('mouse click', actions, button);
  }
}

class Hold extends Mouse {
  constructor(actions, button) {
    super('mouse hold', actions, button);
  }
}

class Release extends Mouse {
  constructor(actions, button) {
    super('mouse release', actions, button);
  }
}

Mouse.Click = Click;
Mouse.Hold = Hold;
Mouse.Release = Release;