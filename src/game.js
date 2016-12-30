import Game from './tetryon2/game'
import Engine from './tetryon2/engine'
import Input from './tetryon2/input'
import PIXI from 'pixi.js'

import { Duration, Transform, Velocity, Force, Thruster, Sprite,
         ShipControl, FollowControl, PlayerControl, ShipSpecs,
         ShieldBurst } from './components'
import { duration, render, physics, thruster, followControl,
         playerControl, shipControl, shieldBurst } from './systems'
import { randomFloat, randomInt, randomRGB, cos, sin, PI } from './math'
import Renderer from './renderer'

export const assets = {
  'assets/snow_particle.png': { name: 'particle' },
  'assets/spaceships/boss1.png': { name: 'boss' },
  'assets/spaceships/player_ship.png': { name: 'player'},
  'assets/spaceships/enemy_1.png': { name: 'enemy1' },
  'assets/spaceships/enemy_2.png': { name: 'enemy2' },
  'assets/spaceships/enemy_3.png': { name: 'enemy3' }
}

export const renderer = new Renderer({assets})
export const game = window.game = new Game()
export const engine = window.engine = new Engine()

function initEngine() {
  engine.addComponentTypes(
    Transform,
    Velocity,
    Force,
    Duration,
    Thruster,
    ShieldBurst,
    Sprite,
    FollowControl,
    PlayerControl,
    ShipControl,
    ShipSpecs
  )

  engine.addSystems(
    duration,
    followControl,
    playerControl,
    shipControl,
    thruster,
    shieldBurst,
    physics,
    render
  )

  game.input.add.button('thrust', Input.Keyboard.UP)
  game.input.add.button('rotateRight', Input.Keyboard.RIGHT)
  game.input.add.button('rotateLeft', Input.Keyboard.LEFT)
  game.input.add.button('shieldBurst', Input.Keyboard.SPACE)

  const spriteNames = ['player', 'enemy1', 'enemy2', 'enemy3']
  const numShips = 25

  const randomShip = () => {
    const spriteName = spriteNames[randomInt(0, spriteNames.length - 1)]
    const rotation = randomFloat(0, Math.PI * 2)
    const speed = randomFloat(0.1, 0.2)
    engine.db.entity()
      .set(Sprite, spriteName)
      .set(Transform, randomFloat(dimensions.width), randomFloat(dimensions.height), rotation + PI/2, 1)
      .set(Velocity, cos(rotation) * speed, sin(rotation) * speed)
      .set(Thruster)
  }

  // for (var i=0; i<numShips; i++) {
  //   randomShip()
  // }

  const w = renderer.dimensions.width
  const h = renderer.dimensions.height

  let e = engine.db.entity()
    .set(Sprite, 'player')
    .set(Thruster)
    .set(PlayerControl)
    .set(ShipControl, false, false, false)
    .set(ShipSpecs, 0.01, 1, 0.007)
    .set(Transform, w/2, h/2, 0, 1)
    .set(Velocity, 0, 0)
    .set(Force, 0, 0)
    .set(ShieldBurst, 6, 18, 0.2, 0.6, 200, 600)

  let lastId = e.id
  const playerId = e.id
  const numFollowers = 80
  console.log(numFollowers)

  const makeFollower = () => {
    const names = ['enemy1', 'enemy2', 'enemy3']

    e = engine.db.entity()
      .set(Sprite, names[randomInt(0, 2)])
      .set(Thruster)
      .set(FollowControl, playerId, randomInt(100, 200))
      .set(ShipControl, false, false, false)
      .set(ShipSpecs, randomFloat(0.0002, 0.0015), 0.5, 0.007)
      .set(Transform, randomFloat(0, w), randomFloat(0, h), 0, 0.6)
      .set(Velocity, 0, 0)
      .set(Force, 0, 0)

    lastId = e.id
  }

  for (var i=0; i<numFollowers; i++) {
    makeFollower()
  }

}

function init() {
  renderer.init(() => {
    initEngine()
    game.pushState({engine})
    game.start()
  })
}

init()
