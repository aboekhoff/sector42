export default class Timer {
  constructor() {
    this.startedAt = null
    this.updatedAt = null
    this.elapsed = 0
  }

  reset() {
    this.startedAt = new Date().getTime()
    this.updatedAt = new Date().getTime() 
    this.elapsed = 0
  }

  update() {
    const currentTime = new Date().getTime() 
    this.elapsed = (currentTime - this.updatedAt)
    this.updatedAt = currentTime
  }
}