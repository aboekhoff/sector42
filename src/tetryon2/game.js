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
    this.stateChange = null
  }

  start() {
    if (this.running) { return }

    this.running = true
    this.time.reset()

    const loop = () => {
      if (this.stateChange) {
        this.performStateChange()
      }

      if (this.running) {
        this.time.update()
        this.tick()
        this.input.update()
      }

      requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)

  }

  getEngine() {
    return this.state.engine
  }

  stop() {
    if (!this.running) { return }
    this.running = false
  }

  tick() {
    this.state.engine.runActiveSystems()
  }

  performStateChange() {
    const [action, nextState] = this.stateChange
    this.stateChange = null

    console.log(action, nextState)

    switch (action) {
      case 'REPLACE':
        if (this.state && this.state.dispose) { this.state.dispose() }
        if (nextState.init) nextState.init()
        this.state = nextState
        return

      case 'PUSH':
        if (this.state) {
          if (this.state.pause) this.state.pause()
          this.stack.push(nextState)
        }
        if (nextState.init) nextState.init()
        this.state = nextState
        return

      case 'POP':
        if (this.state && this.state.dispose) this.state.dispose()
        this.state = this.stack.pop()
        if (this.state.resume) this.state.resume()
        return
    }
  }

  replaceState(state) {
    this.stateChange = ['REPLACE', state]

  }

  pushState(state) {
    this.stateChange = ['PUSH', state]

  }

  popState() {
    this.stateChange = ['POP']
  }

}
