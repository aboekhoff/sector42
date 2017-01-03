import Timer from './util/timer'
import Input from './input'

export default class Game {
  constructor() {
    this.state = null
    this.stack = []
    this.time = new Timer()
    this.running = false
    this.input = new Input()
    this.input.addCallbacks()
  }

  start() {
    if (this.running) { return }

    this.running = true
    this.time.reset()

    const loop = () => {
      if (this.running) {
        this.time.update()
        this.tick()
        this.input.update()
        requestAnimationFrame(loop)
      }
    }

    requestAnimationFrame(loop)

  }

  stop() {
    if (!this.running) { return }
    this.running = false
  }

  tick() {
    this.state.engine.runActiveSystems()
  }

  setState(state) {
    if (this.state) { this.state.destroy() }
    this.state = state
  }

  pushState(state) {
    if (this.state) { this.stack.push(state) }
    this.state = state
  }

  popState() {
    this.state = this.stack.pop()
  }


}
