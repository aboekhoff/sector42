import {
  Transform,
  Force,
  Velocity,
  Duration,
  Sprite,
  Thruster,
  ShieldBurst,
  FollowControl,
  ShipControl,
  ShipSpecs,
  PlayerControl,
} from './components'

import { game, engine, renderer } from './game'
import { randomFloat, randomInt, RGB, randomRGB, cos, sin, min, atan2, abs, PI, TAU } from './math'

export const playerControl = {
  dependencies: [PlayerControl, ShipControl],
  each: function(e) {
    const sc = e.get(ShipControl)
    sc.accelerating = game.input.buttons.thrust.isDown()
    sc.rotatingRight = game.input.buttons.rotateRight.isDown()
    sc.rotatingLeft = game.input.buttons.rotateLeft.isDown()
    sc.shieldBursting = game.input.buttons.shieldBurst.isDown()
  }
}

export const followControl = {
  dependencies: [FollowControl, ShipControl, Transform],
  each: function(e) {
    const fc = e.get(FollowControl)
    const sc = e.get(ShipControl)
    const ft = e.get(Transform)
    const tt = engine.db.entity(fc.targetId).get(Transform)

    const dx = ft.x - tt.x
    const dy = ft.y - tt.y

    sc.accelerating = false
    sc.rotatingRight = false
    sc.rotatingLeft = false

    const distance = Math.sqrt(dx * dx + dy * dy)
    const theta = atan2(tt.y - ft.y, tt.x - ft.x)
    const left = abs(theta < ft.rotation ? ft.rotation - theta : ft.rotation + (TAU - theta))
    const right = abs(ft.rotation < theta ? theta - ft.rotation : (TAU - ft.rotation) + theta)
    const deltaTheta = min(left, right)

    if (deltaTheta >= PI/16) {
      if (right < left) {
        sc.rotatingRight = true
      } else if (left <= right) {
        sc.rotatingLeft = true
      }
    }

    if (deltaTheta < PI/4 && distance > fc.followDistance) {
      sc.accelerating = true
    }

  }
}

export const shipControl = {
  dependencies: [ShipControl, Transform, ShipSpecs, Force],
  each: function(e) {
    const control = e.get(ShipControl)
    const specs = e.get(ShipSpecs)
    const force = e.get(Force)
    const transform = e.get(Transform)

    if (control.accelerating) {
      const impulse = specs.thrust / specs.mass
      const x = Math.cos(transform.rotation)
      const y = Math.sin(transform.rotation)
      force.x += x * impulse
      force.y += y * impulse
    }

    if (control.rotatingRight) {
      transform.rotation += specs.rotationSpeed * game.time.elapsed
    }

    if (control.rotatingLeft) {
      transform.rotation -= specs.rotationSpeed * game.time.elapsed
    }

    if (transform.rotation < -PI) { transform.rotation += TAU }
    else if (transform.rotation > PI) { transform.rotation -= TAU }

  }
}

export const shieldBurst = {
  dependencies: [ShieldBurst, ShipControl, Transform, Velocity],
  each: function(e) {
    const sc = e.get(ShipControl)
    if (!sc.shieldBursting) { return }

    const t = e.get(Transform)
    const v = e.get(Velocity)

    const {
      minParticles,
      maxParticles,
      minForce,
      maxForce,
      minDuration,
      maxDuration
    } = e.get(ShieldBurst)

    const numParticles = randomInt(minParticles, maxParticles)
    const force = randomFloat(minForce, maxForce)
    const duration = randomInt(minDuration, maxDuration)

    const step = TAU / numParticles
    let theta = -PI + randomFloat(0, step)

    for (let i=0; i<numParticles; i++) {
      const dx = cos(theta)
      const dy = sin(theta)
      theta += step

      engine.db.entity()
        .set(Sprite, 'particle')
        .set(Transform, t.x + (dx * t.scale), t.y + (dy * t.scale), 0, 0.04 * t.scale)
        .set(Velocity, v.x, v.y)
        .set(Force, dx * (force * t.scale), dy * (force * t.scale))
        .set(Duration, duration)
    }
  }
}

export const thruster = {
  dependencies: [Thruster, Transform, Velocity, ShipControl],
  each: function(e) {
    const c = e.get(ShipControl)
    if (!c.accelerating) { return }
    const numParticles = randomInt(2, 6)
    const t = e.get(Transform)
    const v = e.get(Velocity)
    for (var i=0; i < numParticles; i++) {
      const theta = t.rotation + PI + randomFloat(-PI/6 * t.scale, PI/6 * t.scale)
      const x = cos(theta)
      const y = sin(theta)
      const speed = randomFloat(0.1, 0.3) * t.scale

      engine.db.entity()
        .set(Transform, t.x + Math.cos(t.rotation + Math.PI) * 20 *t.scale, t.y + Math.sin(t.rotation + Math.PI) * 20 * t.scale, 0, 0.03 * t.scale)
        .set(Velocity, v.x, v.y)
        .set(Force, x * speed, y * speed)
        .set(Sprite, 'particle', 0.02, 0.02)
        .set(Duration, randomInt(50, 150))
    }
  }
}

export const duration = {
  dependencies: [Duration],
  each: function(e) {
    const d = e.get(Duration)
    d.timeRemaining -= game.time.elapsed
    if (d.timeRemaining <= 0) {
      e.dispose()
    }
  }
}

const TOP_SPEED = 0.4
const FRICTION = 0.995

export const physics = {
  dependencies: [Transform, Velocity, Force],
  each: function(e) {
    const f = e.get(Force)
    const v = e.get(Velocity)
    const t = e.get(Transform)

    v.x *= FRICTION
    v.y *= FRICTION

    v.x += f.x; f.x = 0
    v.y += f.y; f.y = 0

    // v.x = min(v.x, TOP_SPEED)
    // v.y = min(v.y, TOP_SPEED)

    t.x += v.x * game.time.elapsed
    t.y += v.y * game.time.elapsed

    const w = renderer.dimensions.width
    const h = renderer.dimensions.height

    if (t.x < 0) { t.x = 0; v.x *= -1 }
    else if (t.x > w) { t.x = w; v.x *= -1 }

    if (t.y < 0) { t.y = 0; v.y *= -1 }
    else if (t.y > h) { t.y = h; v.y *= -1 }
  }
}

export const render = {
  dependencies: [Transform, Sprite],

  each: function(e) {
    const t = e.get(Transform)
    const s = e.get(Sprite)

    s.sprite.position.x = t.x
    s.sprite.position.y = t.y
    s.sprite.rotation = t.rotation + s.baseRotation
    s.sprite.scale.x = t.scale
    s.sprite.scale.y = t.scale
  },

  after: function() {
    renderer.render()
  }
}
