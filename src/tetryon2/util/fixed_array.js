// fixed sized array that mimics some functionality of variable length arrays

export default class FixedArray {
  constructor(size) {
    this.array = new Array(size)
    this.length = 0
    this.clear()
  }

  clear() {
    for (let i=this.length; i<this.array.length; i++) {
      this.array[i] = null
    }
  }

  empty() {
    this.length = 0
    this.clear()
  }

  push(x) {
    const array = this.array
    array[this.length] = x
    this.length += 1
  }

  pop() {
    if (this.length === 0) {
      return null
    }

    const array = this.array
    const index = this.length - 1
    const obj = array[index]
    array[index] = null
    this.length -= 1
    return obj
  }

  forEach(f) {
    const array = this.array
    const length = this.length 
    for (let i=0; i<length; i++) {
      f(array[i], i)
    }
  }

  copy(out=[]) {
    const array = this.array
    for (let i=0; i<this.length; i++) {
      out.push(array[i])
    }
  }

}