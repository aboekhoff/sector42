import Engine from '../tetryon2/engine'
import Input from '../tetryon2/input'
import { game, world, renderer, audioManager } from '../game'
import { Camera, Duration, Transform, Velocity, Force, Thruster, Sprite,
         ShipControl, FollowControl, Physics, PlayerControl, ShipSpecs,
         ParticleCannon, Collidable, Collider, CollisionInfo, Pulse } from '../components'
import { duration, camera, render, force, motion, thruster, followControl,
         playerControl, shipControl, collision, audio,
         postCollision, particleCannon, pulse, timing } from '../systems'
import { randomFloat, randomInt, randomRGB, cos, sin, PI } from '../math'
import { Stars, Scout, Fighter, Corsair, Carrier, Mini } from '../actors'

export default class PlayState {
  constructor(engine=null, db=null, options={}) {
    this.engine = engine || new Engine(db)
  }

  pause() {
    this.removeButtons()
  }

  dispose() {
    this.removeButtons()
  }

  resume() {
    this.addButtons()
    this.setScale()
  }

  setScale() {
    renderer.stage.scale.x = 0.8
    renderer.stage.scale.y = 0.8
  }

  removeButtons() {
    game.input.remove.button('thrust')
    game.input.remove.button('rotateRight')
    game.input.remove.button('rotateLeft')
    game.input.remove.button('fire')
    game.input.remove.button('pause')
  }

  addButtons() {
    game.input.add.button('thrust', Input.Keyboard.UP)
    game.input.add.button('rotateRight', Input.Keyboard.RIGHT)
    game.input.add.button('rotateLeft', Input.Keyboard.LEFT)
    game.input.add.button('fire', Input.Keyboard.SPACE)
    game.input.add.button('pause', Input.Keyboard.SPACE)
  }

  init() {
    console.log('init called')
    const engine = this.engine

    engine.addComponentTypes(
      Transform,
      Velocity,
      Force,
      Camera,
      Duration,
      Thruster,
      ParticleCannon,
      Physics,
      Sprite,
      FollowControl,
      PlayerControl,
      Pulse,
      ShipControl,
      ShipSpecs,
      Collidable,
      Collider,
      CollisionInfo
    )

    engine.addSystem(timing)
    engine.addSystem(audio)
    engine.addSystem(playerControl)
    engine.addSystem(followControl)
    engine.addSystem(shipControl)
    engine.addSystem(thruster)
    engine.addSystem(particleCannon)
    engine.addSystem(force)
    engine.addSystem(collision)
    engine.addSystem(postCollision)
    engine.addSystem(render)
    engine.addSystem(motion)
    engine.addSystem(camera)
    engine.addSystem(pulse)
    engine.addSystem(duration)

    const w = world.width
    const h = world.height

    let e = Scout(w/2, h/2, 'hero')
      .set(PlayerControl)
      .set(ParticleCannon, PI/128, 3, 100, 'hero')
      .set(Camera, 1, 1.6)

    console.log(e.inspect().Camera)

    let lastId = e.id
    const playerId = e.id

    const makeFollower = (prototype) => {
      const follower = prototype(randomFloat(0, w), randomFloat(0, h), 'villain')
        .set(FollowControl, playerId, randomInt(100, 200))

      lastId = follower.id

      return follower
    }

    const numMinis = 0
    const numFighters = 40
    const numCorsairs = 20
    const numCarriers = 2

    console.log({
      numMinis, numCorsairs, numCarriers, numFighters
    })

    for (var i=0; i<numMinis; i++) {
      makeFollower(Mini)
    }

    for (var i=0; i<numCorsairs; i++) {
      makeFollower(Corsair)
    }

    for (var i=0; i<numCarriers; i++) {
      makeFollower(Carrier)
    }

    for (var i=0; i<numFighters; i++) {
      makeFollower(Fighter)
    }

    Stars()
    renderer.stage.pivot.x = world.width/2
    renderer.stage.pivot.y = world.height/2
    this.addButtons()
    this.setScale()
  }
}
