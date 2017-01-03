export function randomFloat(min, max) {
  if (arguments.length == 1) { max = min; min = 0 }
  return Math.random() * (max-min) + min
}

export function randomInt(min, max) {
  return Math.round(randomFloat(min, max))
}

export function RGB(r, g, b) {
  return (r << 16) | (g << 8) | b
}

export function randomRGB(min, max) {
  min = Math.max(min || 0, 0)
  max = Math.min(max || 255, 255)
  const r = randomInt(min, max)
  const g = randomInt(min, max)
  const b = randomInt(min, max)
  return RGB(r, g, b)
}

export const PI = Math.PI
export const TAU = PI * 2
export const abs = Math.abs
export const min = Math.min
export const max = Math.max
export const cos = Math.cos
export const sin = Math.sin
export const atan2 = Math.atan2

export const lerp = (a, b, s) => {
  return a + (b - a) * s
}

// utility to specify random float ranges in place of numbers
export class FloatRange {
  constructor (min, max) {
    this.min = min
    this.max = max
  }

  toString() { return '' + this.valueOf() }

  valueOf() {
    return randomFloat(this.min, this.max)
  }
}

// utility to specify random int ranges in place of numbers
export class IntRange {
  constructor(min, max) {
    this.min = min
    this.max = max
  }

  toString() { return '' + this.valueOf() }

  valueOf() {
    return randomInt(min, max)
  }
}
