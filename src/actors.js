import { engine, renderer } from './game'
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
import { TAU, PI, randomInt, randomFloat, max, cos, sin } from './math'

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

export const Carrier = (x, y, team) => {
  const e = engine.db.entity()
    .set(Sprite, 'boss', 0.5, 0.2, -Math.PI/2)
    .set(Transform, x, y, 0, 1)
    .set(Velocity, 0, 0)
    .set(Force, 0, 0)
    .set(Physics, 1.2, 0.02)
    .set(Thruster)
    .set(ShipControl)
    .set(Collider)
    .set(ShipSpecs, randomFloat(0.04, 0.06))
    .set(CollisionInfo, 60, team, 0)
  return setCollidable(e)
}

export const Mini = (x, y, team) => {
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
    .set(ShipSpecs, randomFloat(0.01, 0.02), 0.01)
    .set(CollisionInfo, 24, team, 0)
  return setCollidable(e)
}

export const Fighter = (x, y, team) => {
  const scale = 0.9
  const e = engine.db.entity()
    .set(Sprite, 'enemy1', 0.5, 0.5, -Math.PI/2)
    .set(Transform, x, y, 0, scale)
    .set(Velocity, 0, 0)
    .set(Force, 0, 0)
    .set(Physics, 1.1, 0.02)
    .set(Thruster)
    .set(ShipControl)
    .set(ShipSpecs, randomFloat(0.04, 0.06), 0.01)
    .set(Collider)
    .set(CollisionInfo, 8, team, 0)
  return setCollidable(e)
}

export const Corsair = (x, y, team) => {
  const e = engine.db.entity()
    .set(Sprite, 'enemy3', 0.5, 0.5, -Math.PI/2)
    .set(Transform, x, y, 0, 1.2)
    .set(Velocity, 0, 0)
    .set(Force, 0, 0)
    .set(Physics, 1.12, 0.02)
    .set(Thruster)
    .set(ShipControl)
    .set(ShipSpecs, randomFloat(0.04, 0.06), 0.01)
    .set(Collider)
    .set(CollisionInfo, 16, team, 0)

  return setCollidable(e)
}

export const CannonParticle = (x, y, vx, vy, theta, team) => {
  const force = randomFloat(3, 5)
  const duration = randomInt(200, 400)
  const dx = cos(theta)
  const dy = sin(theta)
  const scale = randomFloat(0.04, 0.1)

  const p = engine.db.entity()
    .set(Sprite, 'particle')
    .set(Transform, x + dx * 30, y + dy * 30, 0, scale)
    .set(Velocity, vx + (dx * force), vy + (dy * force))
    .set(Force, 0, 0)
    .set(Duration, duration)
    .set(Pulse, 0.06, 0.12, 0.06 / 200)
    .set(Physics, 1.2, 0)
    .set(Collider)
    .set(CollisionInfo, 1, team, 1)
  return setCollidable(p)
}

const PULSE_SIZE = 0.2
const PULSE_TIME = 100
console.log({PULSE_SIZE, PULSE_TIME})

export const ImpactPulse = (e) => {
  const t = e.get(Transform)
  const v = e.get(Velocity)

  engine.db.entity()
    .set(Sprite, 'particle')
    .set(Transform, t.x, t.y, 0, 0)
    .set(Velocity, v.x, v.y)
    .set(Pulse, 0, PULSE_SIZE, PULSE_SIZE / PULSE_TIME)
    .set(Duration, PULSE_TIME * 2)
}

export const Explosion = (e) => {
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
      .set(Velocity, v.x, v.y)
      .set(Force, dx * (force * t.scale), dy * (force * t.scale))
      .set(Duration, duration)
      .set(Physics, 1, 0.01)
  }
}
