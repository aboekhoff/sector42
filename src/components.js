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

export function Velocity(x, y) {
  this.x = x
  this.y = y
}

export function ShipControl(accelerating, rotatingLeft, rotatingRight) {
  this.accelerating = accelerating
  this.rotatingRight = rotatingRight
  this.rotatingLeft = rotatingLeft
}

export function ShipSpecs(thrust, mass, rotationSpeed) {
  this.thrust = thrust
  this.mass = mass
  this.rotationSpeed = rotationSpeed
}

export class Sprite {
  constructor(spriteName) {
    if (spriteName) {
      this.baseRotation = Math.PI/2
      if (spriteName === 'boss' || spriteName === 'enemy2' || spriteName === 'enemy3') { this.baseRotation += Math.PI }
      this.spriteName = spriteName
      this.sprite = renderer.sprites[spriteName].create()
      if (spriteName === 'boss')
      this.sprite.anchor.y = 0.2
    } else {
      this.baseRotation = null
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

export function ShieldBurst(minParticles, maxParticles, minForce, maxForce, minDuration, maxDuration) {
  this.minParticles = minParticles
  this.maxParticles = maxParticles
  this.minForce = minForce
  this.maxForce = maxForce
  this.minDuration = minDuration
  this.maxDuration = maxDuration
}

export function PlayerControl() {
}

export function FollowControl(targetId, followDistance) {
  this.targetId = targetId
  this.followDistance = followDistance
}
