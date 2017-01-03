import { engine, renderer } from './game'

export function Duration(timeRemaining) {
  this.timeRemaining = timeRemaining
}

export function Transform(x, y, rotation, scale) {
  this.x = x
  this.y = y
  this.rotation = rotation
  this.scale = scale
}

export function Force(x, y) {
  this.x = x
  this.y = y
}

export function Delay(time) {
  this.time = time
}

const FRICTION = 0.99
export function Physics(mass, friction = FRICTION) {
  this.mass = mass
  this.friction = friction
}

export function Camera(smoothing = 1, maxDelta = 0.1, dx, dy) {
  this.smoothing = smoothing
  this.maxDelta = maxDelta
  this.dx = dx
  this.dy = dy
}

export function Velocity(x, y) {
  this.x = x
  this.y = y
}

export function CollisionInfo(hitPoints=1, team=null, damage=0) {
  this.hitPoints = hitPoints
  this.team = team
  this.damage = damage
}

export function Collidable(x1, y1, x2, y2) {
  this.x1 = x1
  this.x2 = x2
  this.y1 = y1
  this.y2 = y2
}

export function Collider(x1=0, y1=0, x2=0, y2=0, collisions = []) {
  this.x1 = x1
  this.x2 = x2
  this.y1 = y1
  this.y2 = y2
  this.collisions = collisions
}

export function ShipControl(accelerating=false, rotatingLeft=false, rotatingRight=false, firingWeapon=false) {
  this.accelerating = accelerating
  this.rotatingRight = rotatingRight
  this.rotatingLeft = rotatingLeft
  this.firingWeapon = firingWeapon
}

export function Weapon(type, damage) {
  this.type = type
  this.damage = damage
}

console.log("WTFFF")

export function ShipSpecs(thrust=1, rotationalAcceleration=0.00001, maxRotationalVelocity=Math.PI/250, rotationalVelocity=0) {
  this.thrust = thrust
  this.rotationalAcceleration = rotationalAcceleration
  this.maxRotationalVelocity = maxRotationalVelocity
  this.rotationalVelocity = rotationalVelocity
}

export class Sprite {
  constructor(spriteName, anchorX=0.5, anchorY=0.5, baseRotation = Math.PI/2) {
    if (spriteName) {
      this.spriteName = spriteName
      this.baseRotation = baseRotation
      this.sprite = renderer.sprites[spriteName].create()
      this.sprite.anchor.x = anchorX
      this.sprite.anchor.y = anchorY
    } else {
      this.spriteName = null
      this.sprite = null
    }
  }

  static onDispose(instance) {
    const {spriteName, sprite} = instance
    if (spriteName) {
      const spriteManager = renderer.sprites[spriteName]
      spriteManager.dispose(sprite[spriteManager.key])
      instance.sprite = null
    }
  }
}

export function Thruster(particle, spread, minDuration, maxDuration) {
  this.particle = particle
  this.spread = spread
  this.minDuration = minDuration
  this.maxDuration = maxDuration
}

export function ParticleCannon(spread = 0, numParticles, ROF, team, cooldown=0) {
  this.spread = spread
  this.numParticles = numParticles
  this.ROF = ROF
  this.cooldown = cooldown
  this.team = team
}

export function PlayerControl() {
}

export function FollowControl(targetId, followDistance) {
  this.targetId = targetId
  this.followDistance = followDistance
}

export function Pulse(min, max, rate) {
  this.min = min
  this.max = max
  this.rate = rate
}
