import { Entity, Trigger, TriggerList, Action, ActionList, Position } from './module.js';

export default new Entity(
  'car_racing',
  'car_racing',
  true,
  false,
  new TriggerList(
    new Trigger.Create(
      new ActionList(
        new Action.SetVariable('self', 'this.dead', false),
        new Action.SpeedVertical('self', 0)
      )
    ),
    new Trigger.Step(
      new ActionList(
        new Action.TestExpression('self', 'this.dead'),
        new Action.ExitTrigger(),
        new Action.TestExpression('self', 'global.petrol <= 0'),
        new Action.SpeedVertical('self', 3),
        new Action.SetVariable('self', 'global.petrol', -1, true)
      )
    ),
    new Trigger.Collision(
      new ActionList(
        new Action.TestExpression('self', 'this.dead'),
        new Action.ExitTrigger(),
        new Action.PlaySound('self', 'collision'),
        new Action.ChangeSprite('self', 'racing_dead', 0, 1),
        new Action.SpeedVertical('self', 3),
        new Action.SetVariable('self', 'this.dead', true)
      ),
      'car_down'
    ),
    new Trigger.Collision(
      new ActionList(
        new Action.TestExpression('self', 'this.dead'),
        new Action.ExitTrigger('self'),
        new Action.PlaySound('self', 'collision'),
        new Action.ChangeSprite('self', 'racing_dead', 0, 1),
        new Action.SpeedVertical('self', 3),
        new Action.SetVariable('self', 'this.dead', true)
      ),
      'car_up'
    ),
    new Trigger.Collision(
      new ActionList(
        new Action.TestExpression('self', 'this.dead'),
        new Action.ExitTrigger(),
        new Action.PlaySound('self', 'gas_sound'),
        new Action.SetVariable(
          'self',
          'global.petrol',
          'Math.min(1000, global.petrol + 400)'
        ),
        new Action.DestroyUnit('other')
      ),
      'gas'
    ),
    new Trigger.Collision(
      new ActionList(
        new Action.TestExpression('self', 'this.dead'),
        new Action.ExitTrigger('self'),
        new Action.PlaySound('self', 'collision'),
        new Action.ChangeSprite('self', 'racing_dead', 0, 1),
        new Action.SpeedVertical('self', 3),
        new Action.SetVariable('self', 'this.dead', true)
      ),
      'police'
    ),
    new Trigger.Keyboard.Press(
      new ActionList(
        new Action.CheckSound('self', 'horn'),
        new Action.ExitTrigger(),
        new Action.PlaySound('self', 'horn')
      ),
      'space'
    ),
    new Trigger.Keyboard.Press(
      new ActionList(
        new Action.TestExpression(
          'self',
          'global.petrol > 0 && this.x > 32 && !this.dead'
        ),
        new Action.JumpToPosition('self', new Position(-2, 0), true)
      ),
      'left'
    ),
    new Trigger.Keyboard.Press(
      new ActionList(
        new Action.TestExpression('self', 'global.petrol > 0 && !this.dead'),
        new Action.JumpToPosition('self', new Position(0, -3), true)
      ),
      'up'
    ),
    new Trigger.Keyboard.Press(
      new ActionList(
        new Action.TestExpression(
          'self',
          'global.petrol > 0 && this.x < 360 && !this.dead'
        ),
        new Action.JumpToPosition('self', new Position(2, 0), true)
      ),
      'right'
    ),
    new Trigger.Keyboard.Press(
      new ActionList(
        new Action.TestExpression('self', 'global.petrol > 0 && !this.dead'),
        new Action.JumpToPosition('self', new Position(0, 3), true)
      ),
      'down'
    ),
    new Trigger.OutsideRoom(
      new ActionList(
        new Action.StopSound('self', 'sirens'),
        new Action.Sleep('self', 1000, true),
        new Action.SetLives('self', -1, true),
        new Action.RestartCurrentZone('self')
      )
    )
  )
);
