import Engine from '../tetryon2/engine'
import Input from '../tetryon2/input'
import { game, renderer, audioPlayer } from '../game'
import { titleScreen } from '../systems'

export default class TitleScreenState {
  constructor(engine=null, db=null, options={}) {
    this.engine = engine || new Engine(db)
  }

  addButtons() {
    game.input.add.button('start', Input.Keyboard.ENTER)
    game.input.add.button('right', Input.Keyboard.RIGHT)
    game.input.add.button('left', Input.Keyboard.LEFT)
  }

  removeButtons() {
    game.input.remove.button('start')
    game.input.remove.button('right')
    game.input.remove.button('left')
  }

  removeText() {
    renderer.stage.removeChild(this.text)
  }

  setText() {
    if (!this.text) {
      this.text = new PIXI.Text(
        'SECTOR 42',
        { font: '150px Arial', fill: 'red' }
      )
    }
    renderer.stage.addChild(this.text)
    this.text.position.x = -this.text.width/2
    this.text.position.y = -200
    console.log(this.text, renderer.stage)
  }

  playTheme() {
    audioPlayer.setTheme('almost_there')
  }

  setScale() {
    renderer.stage.scale.x = 1
    renderer.stage.scale.y = 1
  }

  pause() {
    this.removeButtons()
    this.removeText()
  }

  resume() {
    this.setScale()
    this.addButtons()
    this.playTheme()
    this.setText()
  }

  init() {
    this.addButtons()
    this.setScale()
    this.playTheme()
    this.setText()
    this.engine.addSystem(titleScreen)
  }
}
