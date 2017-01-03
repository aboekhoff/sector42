import Game from './tetryon2/game'
import Engine from './tetryon2/engine'
import Input from './tetryon2/input'
import Quadtree from './tetryon2/util/quadtree'
import PIXI from 'pixi.js'
import { Camera, Duration, Transform, Velocity, Force, Thruster, Sprite,
         ShipControl, FollowControl, Physics, PlayerControl, ShipSpecs,
         ParticleCannon, Collidable, Collider, CollisionInfo, Pulse } from './components'
import { duration, camera, render, force, motion, thruster, followControl,
         playerControl, shipControl, collision,
         postCollision, particleCannon, pulse, timing } from './systems'
import { randomFloat, randomInt, randomRGB, cos, sin, PI } from './math'
import Renderer from './renderer'

import { Fighter, Carrier, Mini, Corsair, Scout } from './actors'

export const assets = [
  {
    name: 'particle',
    url: 'assets/snow_particle.png'
  },
  {
    name: 'star',
    url: 'assets/snow_particle.png'
  },
  {
    name: 'boss',
    url: 'assets/spaceships/boss1.png',
  },
  {
    name: 'player',
    url: 'assets/spaceships/player_ship.png',
  },
  {
    name: 'enemy1',
    url: 'assets/spaceships/enemy_1.png',
  },
  {
    name: 'enemy2',
    url: 'assets/spaceships/enemy_2.png',
  },
  {
    name: 'enemy3',
    url: 'assets/spaceships/enemy_3.png',
  }
]

export const renderer = window.renderer = new Renderer({assets})
export const game = window.game = new Game()
export const engine = window.engine = new Engine()
export const qt = window.qt = Quadtree.create(window.innerWidth, window.innerHeight)

window.addEventListener('resize', () => {
  qt.resize(window.innerWidth, window.innerHeight)
})

export const world = {
  width: 20000,
  height: 20000,
  numStars: 8000,
}

export const drawStars = () => {
  const { width, height, numStars } = world
  const dist = (width * height) / numStars

  const makeStar = (x, y) => {
    const scale = randomFloat(0.01, 0.02)
    const e = engine.db.entity()
      .set(Sprite, 'star')
      .set(Transform, x, y, 0, scale)
  }

  // tacks to hold down the map at the edges
  makeStar(0, 0)
  makeStar(width, 0)
  makeStar(width, height)
  makeStar(0, height)

  for (let i=0; i < numStars; i++) {
    makeStar(randomInt(0, width), randomInt(0, height))
  }
}

function initEngine() {
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
  engine.addSystem(playerControl)
  engine.addSystem(followControl)
  engine.addSystem(shipControl)
  engine.addSystem(thruster)
  engine.addSystem(particleCannon)
  engine.addSystem(collision)
  engine.addSystem(postCollision)
  engine.addSystem(force)
  engine.addSystem(render)
  engine.addSystem(motion)
  engine.addSystem(camera)
  engine.addSystem(pulse)
  engine.addSystem(duration)

  game.input.add.button('thrust', Input.Keyboard.UP)
  game.input.add.button('rotateRight', Input.Keyboard.RIGHT)
  game.input.add.button('rotateLeft', Input.Keyboard.LEFT)
  game.input.add.button('fire', Input.Keyboard.SPACE)

  const w = world.width
  const h = world.height

  let e = Scout(w/2, h/2, 'hero')
    .set(PlayerControl)
    .set(ParticleCannon, PI/128, 3, 32, 'hero')
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

  const numMinis = 200
  const numFighters = 20
  const numCorsairs = 8
  const numCarriers = 0

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

  drawStars()

  renderer.stage.pivot.x = world.width/2
  renderer.stage.pivot.y = world.height/2
}

function init() {
  renderer.init(() => {
    initEngine()
    game.pushState({engine})
    game.start()
  })
}

init()
