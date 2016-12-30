// allocate is called with the current pool index (useful for assigning ids)
// customize is called with an unused instance and an array of any additional params

export default class ObjectPool {
  constructor(options={}) {
    this.marker = 0
    this.pool = []
    this.index = []
    this.key = options.key

    this.allocate = options.allocate
    this.customize = options.customize
    this._dispose = options.dispose
    this.poolSize = options.poolSize || 32
    this.indexSize = options.indexSize || this.poolSize

    this.expandPool(this.poolSize)
    this.expandIndex(this.indexSize)
  }

  expandPool(amount) {
    const currentSize = this.pool.length
    const newSize = currentSize + amount
    this.pool.length = newSize
    for (let i=currentSize; i<newSize; i++) {
      this.pool[i] = this.allocate(i)
    }
  }

  expandIndex(amount) {
    const currentSize = this.index.length
    const newSize = currentSize + amount
    this.index.length = newSize
    for (let i=currentSize; i<newSize; i++) {
      this.index[i] = 0
    }
  }

  get(id) {
    const poolIndex = this.index[id]
    return poolIndex > 0 ? this.pool[poolIndex-1] : null
  }

  create(...params) {
    while (this.marker >= this.pool.length) {
      this.expandPool(this.poolSize)
    }

    const instance = this.pool[this.marker]
    if (this.customize) { this.customize(instance, ...params) }

    const id = instance[this.key]

    if (typeof id != 'number') {
      throw Error(
        `expected created instance '${this.key}' property to be integer but got ${id}`
      )
    }

    while (id >= this.index.length) {
      this.expandIndex(this.indexSize)
    }

    this.index[id] = this.marker+1
    this.marker += 1
    return instance
  }

  dispose(disposeId) {
    const key = this.key
    const disposeIndex = this.index[disposeId]-1

    if (disposeIndex === -1) { return }

    const disposeInstance = this.pool[disposeIndex]

    if (this._dispose) { this._dispose(disposeInstance) }

    const swapIndex = this.marker-1

    const swapInstance = this.pool[swapIndex]
    const swapId = swapInstance[key]

    this.pool[disposeIndex] = swapInstance
    this.pool[swapIndex] = disposeInstance

    this.index[swapId] = disposeIndex+1
    this.index[disposeId] = 0

    this.marker -= 1
  }

  destroyAll() {
    this.marker = 0
    for (let i=0; i<this.index.length; i++) {
      this.index[i] = 0
    }
  }

  toString() {
    return JSON.stringify(this, true)
  }

}
