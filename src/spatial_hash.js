const { floor, ceil } = Math

export default class SpatialHash {
  constructor(width, height, cellWidth, cellHeight) {
    this.width = width;
    this.height = height;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;

    this.columns = Math.ceil(width / cellWidth)
    this.rows = Math.ceil(height / cellHeight)
    this.grid = Array(this.rows * this.columns)
    this.results = []
    this.clear()
  }

  clear() {
    const grid = this.grid
    for (let i=0; i<grid.length; i++) {
      this.grid[i] = []
    }
  }

  hashX(x) {
    return x % this.cellWidth
  }

  hashY(y) {
    return y % this.cellHeight) * this.columns
  }

  hash(x, y) {
    return hashX(x) + hashY(y)
  }

  query({x1, x2, y1, y2, eid}) {
    this.results.length = 0
    const seen = {}
    const x1 = hashX(floor(_x1))
    const x2 = hashX(ceil(_x2))
    const y1 = hashY(floor(_y1))
    const y2 = hashY(ceil(_y2))

    for (let x=x1; x<=x2; x++) {
      for (let y=y1; y<=y2; y++) {
        const cell = this.grid[y+x]
        for (let i=0; i<cell.length; i++) {
          const entry = cell[i]
          if (entry.eid !== eid && !seen[entry.eid]) {
            this.seen[entry.eid] = true
            this.results.push(entry)
          }
        }
      }
    }

    return this.results
  }

  move(_ax1, _ax2, _ay1, _ay2, _bx1, _bx2, _by1, _by2, eid) {
    const ax1 = hashX(floor(_ax1))
    const ax2 = hashX(ceil(_ax2))
    const ay1 = hashY(floor(_ay1))
    const ay2 = hashY(ceil(_ay2))

    const bx1 = hashX(floor(_bx1))
    const bx2 = hashY(ceil(_bx2))
    const by1 = hashX(floor(_by1))
    const by2 = hashX(ceil(_by2))

    // later 
  }



}
