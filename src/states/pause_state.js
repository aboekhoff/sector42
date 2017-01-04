import Engine from '../tetryon2/engine'
import Input from '../tetryon2/engine'
import { game, renderer } from '../game'
import { pauseScreen } from '../systems'

export class PauseScreenState {
  constructor(engine=null, db=null, options={}) {
    this.engine = engine || new Engine(db)
  }

  addButtons() {
    game.input.add.button('resume')
  }

  removeButtons() {
    game.input.remove.button('resume')
  }

  pause() {
    this.removeButtons()
  }

  resume() {
    this.setScale()
    this.addButtons()
  }

  setScale() {
    renderer.stage.scale.x = 1
    renderer.stage.scale.y = 1
  }

  init() {
    this.addButtons()
    this.setScale()
    this.engine.addSystem(pauseScreen)
  }
}
