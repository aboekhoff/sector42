import {
  Transform,
  Physics,
  Force,
  Velocity,
  Duration,
  Camera,
  Collidable,
  Collider,
  CollisionInfo,
  Sprite,
  Thruster,
  ParticleCannon,
  FollowControl,
  ShipControl,
  ShipSpecs,
  Pulse,
  PlayerControl,
} from './components'

import { CannonParticle, Explosion, ImpactPulse } from './actors'

import { world, game, renderer, qt, audioPlayer } from './game'
import { randomFloat, randomInt, RGB, randomRGB, lerp, cos, sin, min, max, atan2, abs, PI, TAU } from './math'

import { cannonSound } from './audio'

import PlayState from './states/play_state'

const kill = (entity) => {
  const d = entity.get(Duration)
  if (d) { d.timeRemaining = 0 } else { entity.set(Duration, 0) }
}

export const timing = {
  elapsedTime: 0,
  maxTimeStep: 64,
  timeScale: 1,
  deltaTime: 0,
  run: function() {
    this.elapsedTime += game.time.elapsed
    const deltaTime = Math.min(this.elapsedTime, this.maxTimeStep)
    this.elapsedTime -= deltaTime
    this.deltaTime = deltaTime * this.timeScale
  }
}

export const audio = {
  dependencies: [CollisionInfo],
  timeBetweenUpdates: 1000,
  elapsedTime: 0,
  currentTheme: null,
  all: function(es) {
    this.elapsedTime += timing.deltaTime
    if (this.elapsedTime < this.timeBetweenUpdates) { return }
    this.elapsedTime -= this.timeBetweenUpdates

    let count = 0

    for (let i=0; i<es.length; i++) {
      const e = es.array[i]
      const c = e.get(CollisionInfo)
      if (c.team !== 'hero' && c.damage === 0) {
        count += 1
      }
    }

    let theme = null

    if (count <= 10) {
      theme = 'to_eris'
    }
    else {
      theme = 'ultraspeed'
    }

    if (theme != this.currentTheme) {
      this.currentTheme = theme
      audioPlayer.setTheme(theme)
    }

  }
}

export const playerControl = {
  dependencies: [PlayerControl, ShipControl],
  each: function(e) {
    const sc = e.get(ShipControl)
    sc.accelerating = game.input.buttons.thrust.isDown()
    sc.rotatingRight = game.input.buttons.rotateRight.isDown()
    sc.rotatingLeft = game.input.buttons.rotateLeft.isDown()
    sc.firingWeapon = game.input.buttons.fire.isDown()
  }
}

export const particleCannon = {
  dependencies: [ShipControl, ParticleCannon, Transform, Velocity],
  each: function(e) {
    const sc = e.get(ShipControl)
    const pc = e.get(ParticleCannon)

    const { ROF, spread, team } = pc
    const numParticles = pc.numParticles.valueOf()

    if (pc.cooldown > 0) {
      pc.cooldown = max(0, pc.cooldown - timing.deltaTime)
    }

    if (!sc.firingWeapon || pc.cooldown > 0) { return }

    pc.cooldown = ROF

    const t = e.get(Transform)
    const v = e.get(Velocity)

    const step = (spread * 2) / numParticles

    let theta = t.rotation - spread
    for (let i=0; i<numParticles; i++) {
      const p = CannonParticle(t.x, t.y, v.x, v.y, theta, team)
      theta += step
    }
    cannonSound.play()
  }
}

export const followControl = {
  dependencies: [FollowControl, ShipControl, Transform],
  each: function(e) {
    const engine = game.getEngine()
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

export const collision = {
  dependencies: [Transform, Collidable, Collider],
  detectedCollisions: [],
  all: function({array, length}) {
    const engine = game.getEngine()
    qt.clear()

    for (let i=0; i<length; i++) {
      const e = array[i]
      const t = e.get(Transform)
      const c = e.get(Collidable)
      const cc = e.get(Collider)

      // console.log(`colliding ${e.id}`)
      cc.collisions.length = 0
      cc.x1 = t.x - c.x1
      cc.x2 = t.x + c.x2
      cc.y1 = t.y - c.y1
      cc.y2 = t.y + c.y2
      qt.insert(cc)
    }

    const dc = this.detectedCollisions
    dc.length = 0

    for (let i=0; i<length; i++) {
      const e = array[i]
      const cc = e.get(Collider)
      const result = qt.query(cc)
      if (result.length > 0) {
        cc.collisions = result
        dc.push(cc)
      }
    }

    const seen = {}

    for (let i=0; i<dc.length; i++) {
      const c1 = dc[i]
      const e1 = engine.db.entity(c1.eid)
      const ci1 = e1.get(CollisionInfo)

      inner:for (let j=0; j<c1.collisions.length; j++) {
        const c2 = c1.collisions[j]
        const e2 = engine.db.entity(c2.eid)
        const ci2 = e2.get(CollisionInfo)

        // don't check collisions between teammates
        if (ci1.team === ci2.team) { continue inner}

        const key = e1.id < e2.id ? `${e1.id}_${e2.id}` : `${e2.id}_${e1.id}`

        if (seen[key]) { continue }
        seen[key] = true

        const v1 = e1.get(Velocity)
        const p1 = e1.get(Physics)
        const v2 = e2.get(Velocity)
        const p2 = e2.get(Physics)

        v2.x += (v1.x * p1.mass) * 0.05
        v1.x -= (v1.x * p2.mass) * 0.05

        v2.y += (v1.y * p1.mass) * 0.05
        v1.y -= (v1.y * p2.mass) * 0.05

        v1.x += (v2.x * p2.mass) * 0.05
        v2.x -= (v2.x * p1.mass) * 0.05

        v1.y += (v2.y * p2.mass) * 0.05
        v2.y -= (v2.y * p1.mass) * 0.05

        ci1.hitPoints -= ci2.damage
        ci2.hitPoints -= ci1.damage

        if (ci1.damage > 0) ImpactPulse(e1, e2)
        if (ci2.damage > 0) ImpactPulse(e2, e1)
      }
    }
  }
}

export const postCollision = {
  dependencies: [CollisionInfo],
  each: function(e) {
    const ci = e.get(CollisionInfo)
    if (ci.hitPoints > 0) { return }
    kill(e)
    if (e.get(ShipSpecs)) Explosion(e)
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
      const impulse = specs.thrust
      const x = Math.cos(transform.rotation)
      const y = Math.sin(transform.rotation)
      force.x += x * impulse
      force.y += y * impulse
    }

    if (control.rotatingRight) {
      specs.rotationalVelocity += specs.rotationalAcceleration * timing.deltaTime
      specs.rotationalVelocity = min(specs.rotationalVelocity, specs.maxRotationalVelocity)
      transform.rotation += specs.rotationalVelocity * timing.deltaTime
    } else if (control.rotatingLeft) {
      specs.rotationalVelocity -= specs.rotationalAcceleration * timing.deltaTime
      specs.rotationalVelocity = max(specs.rotationalVelocity, -specs.maxRotationalVelocity)
      transform.rotation += specs.rotationalVelocity * timing.deltaTime
    } else {
      specs.rotationalVelocity = 0
    }

    while (transform.rotation < -PI) { transform.rotation += TAU }
    while (transform.rotation > PI) { transform.rotation -= TAU }

  }
}

export const thruster = {
  dependencies: [Thruster, Transform, Velocity, ShipControl],
  each: function(e) {
    const engine = game.getEngine()
    const c = e.get(ShipControl)
    if (!c.accelerating) { return }

    const t = e.get(Transform)
    const v = e.get(Velocity)

    const numParticles = randomInt(1, 2)
    const startX = t.x + (Math.cos(t.rotation + Math.PI) * 10 * t.scale)
    const startY = t.y + (Math.sin(t.rotation + Math.PI) * 10 * t.scale)

    for (var i=0; i < numParticles; i++) {
      const theta = t.rotation + PI + randomFloat(-PI/12 * t.scale, PI/12 * t.scale)
      const x = cos(theta)
      const y = sin(theta)
      const impulse = randomFloat(0.2, 0.3) * (t.scale)

      engine.db.entity()
        .set(Transform, startX, startY, 0, 0.05 * t.scale)
        .set(Velocity, v.x, v.y)
        .set(Force, x * impulse, y * impulse)
        .set(Physics, 1, 0)
        .set(Sprite, 'particle')
        .set(Duration, randomInt(100, 200))
    }
  }
}

export const duration = {
  dependencies: [Duration],
  each: function(e) {
    const d = e.get(Duration)
    d.timeRemaining -= timing.deltaTime
    if (d.timeRemaining <= 0) {
      e.dispose()
    }
  }
}

export const pulse = {
  dependencies: [Transform, Pulse],
  each: function(e) {
    const t = e.get(Transform)
    const p = e.get(Pulse)
    const delta = timing.deltaTime * p.rate
    let scale = t.scale + delta

    if (scale > p.max) {
      p.rate *= - 1
      scale -= scale - p.max
    }

    else if (scale < p.min) {
      p.rate *= -1
      scale += p.min - scale
    }

    t.scale = scale
  }
}

export const force = {
  dependencies: [Physics, Velocity, Force],
  each: function(e) {
    const f = e.get(Force)
    const v = e.get(Velocity)
    const p = e.get(Physics)

    v.x += (f.x / p.mass)
    v.y += (f.y / p.mass)

    f.x = 0
    f.y = 0

    v.x *= (1 - p.friction)
    v.y *= (1 - p.friction)
  }
}

export const motion = {
  dependencies: [Transform, Velocity],
  each: function(e) {
    const t = e.get(Transform)
    const v = e.get(Velocity)

    t.x += v.x * timing.deltaTime
    t.y += v.y * timing.deltaTime

    const w = world.width
    const h = world.height

    if (t.x < 0) { t.x = 0; v.x *= -1 }
    else if (t.x > w) { t.x = w; v.x *= -1 }

    if (t.y < 0) { t.y = 0; v.y *= -1 }
    else if (t.y > h) { t.y = h; v.y *= -1 }
  }
}

export const camera = {
  dependencies: [Camera, Velocity, Transform],
  each: function(e) {
    const c = e.get(Camera)
    const t = e.get(Transform)
    const v = e.get(Velocity)
    const { smoothing, maxDelta } = c
    const s = (timing.deltaTime * (smoothing / 1000))
    const p = renderer.stage.pivot

    const dx1 = c.dx || 0
    const dy1 = c.dy || 0

    // interpolated coords
    const x = p.x + (t.x - p.x) * s
    const y = p.y + (t.y - p.y) * s

    // distance from object to interpolated coords
    const dx2 = t.x - x
    const dy2 = t.y - y

    // change in distance from object compared to previous frame
    const ddx = dx2 - dx1
    const ddy = dy2 - dy1

    let dx = dx2
    let dy = dy2

    if (abs(ddx) > maxDelta) {
      dx = dx2 > dx1 ? dx1 + maxDelta : dx1 - maxDelta
    }

    if (abs(ddy) > maxDelta) {
      dy = dy2 > dy1 ? dy1 + maxDelta : dy1 - maxDelta
    }

    const epsilon = 0.001
    if (abs(dx) < epsilon) dx = 0
    if (abs(dy) < epsilon) dy = 0

    // console.log({dx, dy})

    p.x = t.x - dx
    p.y = t.y - dy

    c.dx = dx
    c.dy = dy

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

export const titleScreen = {
  selection: null,
  run() {
    if (game.input.buttons.start.justPressed()) {
      game.pushState(new PlayState(null, game.getEngine().db))
    }
    renderer.render(renderer.stage)
  }
}

export const pauseScreen = {
  run() {
    if (game.input.buttons.start.justPressed()) {
      game.popState()
    }
    renderer.render(renderer.stage)
  }
}
