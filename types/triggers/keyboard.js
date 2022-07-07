import { Trigger } from './trigger.js';

export default class Keyboard extends Trigger {
  constructor(name, actions, key) {
    super(name, actions);
    this.key = key;
  }

  call(unit, misc) {
    super.call(unit, misc);
  }
}

class Press extends Keyboard {
  constructor(actions, key) {
    super('keyboard press', actions, key);
  }
}

class Down extends Keyboard {
  constructor(actions, key) {
    super('keyboard down', actions, key);
  }
}

class Up extends Keyboard {
  constructor(actions, key) {
    super('keyboard up', actions, key);
  }
}

Keyboard.Press = Press;
Keyboard.Down = Down;
Keyboard.Up = Up;