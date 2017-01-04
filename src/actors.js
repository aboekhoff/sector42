import { world, game, renderer } from './game'
import {
  Sprite,
  Physics,
  Transform,
  Velocity,
  Duration,
  Force,
  Thruster,
  Pulse,
  ShipControl,
  ShipSpecs,
  Collidable,
  Collider,
  CollisionInfo,
} from './components'
import { TAU, PI, randomInt, randomFloat, max, cos, sin, atan2 } from './math'
import { explosionSound } from './audio'

export const setCollidable = (entity, type) => {
  const sprite = entity.get(Sprite).sprite
  const scale = entity.get(Transform).scale * 0.9
  const anchorX = sprite.anchor.x
  const anchorY = sprite.anchor.y
  const w = sprite._texture._frame.width
  const h = sprite._texture._frame.height

  const x1 = w * anchorX * scale
  const x2 = w * (1 - anchorX) * scale
  const y1 = h * anchorY * scale
  const y2 = h * (1 - anchorY) * scale

  entity.set(Collidable, x1, y1, x2, y2, type)

  return entity
}

export const Scout = (x, y, team) => {
  const engine = game.getEngine()
  const e = engine.db.entity()
    .set(Sprite, 'player', 0.5, 0.5, Math.PI/2)
    .set(Transform, x, y, 0, 1)
    .set(Velocity, 0, 0)
    .set(Force, 0, 0)
    .set(Physics, 2, 0.02)
    .set(Thruster)
    .set(ShipControl)
    .set(Collider)
    .set(ShipSpecs, 0.1)
    .set(CollisionInfo, 12, team, 0)
  return setCollidable(e)
}

const CARRIER_THRUST = 0.1
const CARRIER_MASS = 4
console.log({CARRIER_THRUST, CARRIER_MASS})
export const Carrier = (x, y, team) => {
  const engine = game.getEngine()
  const e = engine.db.entity()
    .set(Sprite, 'boss', 0.5, 0.2, -Math.PI/2)
    .set(Transform, x, y, 0, 2)
    .set(Velocity, 0, 0)
    .set(Force, 0, 0)
    .set(Physics, CARRIER_MASS, 0.02)
    .set(Thruster)
    .set(ShipControl)
    .set(Collider)
    .set(ShipSpecs, CARRIER_THRUST)
    .set(CollisionInfo, 1000, team, 0)
  return setCollidable(e)
}

export const Mini = (x, y, team) => {
  const engine = game.getEngine()
  const scale = 0.6
  const e = engine.db.entity()
    .set(Sprite, 'enemy2', 0.5, 0.5, -Math.PI/2)
    .set(Transform, x, y, 0, scale)
    .set(Velocity, 0, 0)
    .set(Force, 0, 0)
    .set(Physics, 0.5, 0.02)
    .set(Thruster)
    .set(ShipControl)
    .set(Collider)
    .set(ShipSpecs, randomFloat(0.01, 0.02))
    .set(CollisionInfo, 24, team, 0)
  return setCollidable(e)
}

export const Fighter = (x, y, team) => {
  const engine = game.getEngine()
  const scale = 0.9
  const e = engine.db.entity()
    .set(Sprite, 'enemy1', 0.5, 0.5, -Math.PI/2)
    .set(Transform, x, y, 0, scale)
    .set(Velocity, 0, 0)
    .set(Force, 0, 0)
    .set(Physics, 2, 0.02)
    .set(Thruster)
    .set(ShipControl)
    .set(ShipSpecs, randomFloat(0.04, 0.06))
    .set(Collider)
    .set(CollisionInfo, 24, team, 0)
  return setCollidable(e)
}

export const Corsair = (x, y, team) => {
  const engine = game.getEngine()
  const e = engine.db.entity()
    .set(Sprite, 'enemy3', 0.5, 0.5, -Math.PI/2)
    .set(Transform, x, y, 0, 1.2)
    .set(Velocity, 0, 0)
    .set(Force, 0, 0)
    .set(Physics, 4, 0.02)
    .set(Thruster)
    .set(ShipControl)
    .set(ShipSpecs, randomFloat(0.04, 0.06), 0.01)
    .set(Collider)
    .set(CollisionInfo, 60, team, 0)

  return setCollidable(e)
}

const MIN_FORCE = 10
const MAX_FORCE = 16
console.log({MIN_FORCE, MAX_FORCE})

export const CannonParticle = (x, y, vx, vy, theta, team) => {
  const engine = game.getEngine()
  const force = randomFloat(MIN_FORCE, MAX_FORCE)
  const duration = randomInt(400, 600)
  const dx = cos(theta)
  const dy = sin(theta)
  const scale = randomFloat(0.04, 0.1)

  const p = engine.db.entity()
    .set(Sprite, 'particle')
    .set(Transform, x + dx * 30, y + dy * 30, 0, scale)
    .set(Force, (dx * force), (dy * force))
    .set(Velocity, 0, 0)
    .set(Duration, duration)
    .set(Pulse, 0.06, 0.12, 0.06 / 200)
    .set(Physics, 4, 0.1)
    .set(Collider)
    .set(CollisionInfo, 1, team, 1)
  return setCollidable(p)
}

export const PulseEffect = (
  x, y, size, time,
  scale=1, multiplier=1, vx=0, vy=0, sprite='particle'
) => {
  const engine = game.getEngine()
  const _size = size * scale
  const _time = time * scale

  engine.db.entity()
    .set(Sprite, sprite)
    .set(Transform, x, y, 0, 0)
    .set(Velocity, vx, vy)
    .set(Pulse, 0, _size, _size / _time)
    .set(Duration, _time * multiplier)
}

const IMPACT_PULSE_SIZE = 0.2
const IMPACT_PULSE_TIME = 100
console.log({IMPACT_PULSE_SIZE, IMPACT_PULSE_TIME})

export const ImpactPulse = (e1, e2) => {
  const engine = game.getEngine()
  const t1 = e1.get(Transform)
  const t2 = e2.get(Transform)

  const v2 = e2.get(Velocity)

  const s1 = e1.get(Sprite)
  const s2 = e2.get(Sprite)

  const w1 = s1.sprite._texture._frame.width
  const w2 = s2.sprite._texture._frame.width

  const h1 = s1.sprite._texture._frame.height
  const h2 = s2.sprite._texture._frame.height

  const r1 = (w1 + h1) / 2
  const r2 = (w2 + h2) / 2

  const theta = atan2(t1.y - t2.y, t1.x - t2.x)

  // const x = t1.x - cos(t1.rotation) * r2
  // const y = t1.y - sin(t1.rotation) * r2

  const x = t1.x
  const y = t1.y

  PulseEffect(x, y, IMPACT_PULSE_SIZE, IMPACT_PULSE_TIME, 1, 2, 0, 0)
}

export const Explosion = (e) => {
  const engine = game.getEngine()
  const t = e.get(Transform)
  const v = e.get(Velocity)

  const minParticles = 60
  const maxParticles = 120

  const minForce = 0.05
  const maxForce = 0.3

  const minDuration = 1000
  const maxDuration = 3000

  const numParticles = randomInt(minParticles, maxParticles)

  const step = TAU / numParticles
  let theta = -PI + randomFloat(0, step)

  for (let i=0; i<numParticles; i++) {
    const force = randomFloat(minForce, maxForce)
    const duration = randomInt(minDuration, maxDuration)
    const dx = cos(theta)
    const dy = sin(theta)
    const scale = randomFloat(0.01, 0.02)

    theta += step

    engine.db.entity()
      .set(Sprite, 'particle')
      .set(Transform, t.x + (dx * t.scale), t.y + (dy * t.scale), 0, scale * t.scale)
      // .set(Velocity, v.x, v.y)
      .set(Velocity, 0, 0)
      .set(Force, dx * (force * t.scale), dy * (force * t.scale))
      .set(Duration, duration)
      .set(Physics, 1, 0.05)
  }

  PulseEffect(t.x, t.y, 1.2, 800, t.scale * 0.8)
  explosionSound.play()
}

export const Stars = () => {
  const engine = game.getEngine()
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
