import ObjectPool from './object_pool'

// TODO
// refactor to accept rectangles passed as arrays

export default function Quadtree(level, x1, x2, y1, y2) {
  this.level = level;
  this.x1 = x1;
  this.x2 = x2;
  this.y1 = y1;
  this.y2 = y2;
  this.objects = [];
  this.stuckObjects = [];
  this.nodes = [null, null, null, null];
  if (this.id == null) { this.id = 0 }
}

Quadtree.objectPool = new ObjectPool({
  allocate(i) { 
    const qt = new Quadtree()
    qt.id = i 
    return qt
  },

  customize(instance, params) {
    Quadtree.apply(instance, params)
  },

  poolSize: (4*4*4*4*4) + 1

});

Quadtree.SPLIT_THRESHOLD = 10;
Quadtree.MAX_LEVELS = 5;

Quadtree.create = function(width, height) {
  return this.objectPool.create(0, 0, width, 0, height);
}

Quadtree.prototype.clear = function() {
  if (this.nodes[0] != null) {
    for (var i=0, ii=this.nodes.length; i<ii; i++) {
      this.nodes[i].dispose();
      this.nodes[i] = null;
    }
  }
  this.objects.length = 0;
  this.stuckObjects.length = 0;
}

Quadtree.prototype.dispose = function() {
  this.clear();
  this.constructor.objectPool.dispose(this);
}

Quadtree.prototype.split = function() {
    var pool = this.constructor.objectPool;
    var lvl = this.level + 1;
    var w2 = (this.x2 - this.x1) / 2;
    var h2 = (this.y2 - this.y1) / 2;
    var x1 = this.x1, x2 = this.x1 + w2, x3 = this.x2;
    var y1 = this.y1, y2 = this.y1 + h2, y3 = this.y2;

    this.nodes[0] = pool.create(lvl, x1, x2, y1, y2); // top left
    this.nodes[1] = pool.create(lvl, x2, x3, y1, y2); // top right
    this.nodes[2] = pool.create(lvl, x2, x3, y2, y3); // bottom right
    this.nodes[3] = pool.create(lvl, x1, x2, y2, y3); // bottom left
}

Quadtree.prototype.getIndex = function(rect) {
  var w2 = (this.x2 - this.x1) / 2;
  var h2 = (this.y2 - this.y1) / 2;
  var x1 = this.x1, x2 = this.x1 + w2, x3 = this.x2;
  var y1 = this.y1, y2 = this.y1 + h2, y3 = this.y2;

  var top = rect.y1 > y1 && rect.y2 < y2;
  var bottom = rect.y1 > y2 && rect.y2 < y3;
  var left = rect.x1 > x1 && rect.x2 < x2;
  var right = rect.x1 > x2 && rect.x2 < x3;

  var index = -1;

  if (left) {
    if (top) { index = 0 }
    else if (bottom) { index = 3 }
  }

  else if (right) {
    if (top) { index = 1 }
    if (bottom) { index = 2 }
  }

  return index
}

Quadtree.prototype._insert = function(rect) {
  var index = this.getIndex(rect);
  if (index != -1) {
    this.nodes[index].insert(rect);
  } else {
    this.stuckObjects.push(rect);
  }
}

Quadtree.prototype.insert = function(rect) {
  var canDescend = this.level < this.constructor.MAX_LEVELS;
  var alreadySplit = this.nodes[0] != null;

  var size = this.objects.length;
  var belowThreshold = (size + 1) < this.constructor.SPLIT_THRESHOLD;

  // if at max level or if has not split and below threshold
  if (!canDescend || (!alreadySplit && belowThreshold)) {
    this.objects.push(rect);
    return;
  }

  // if already split just return
  if (alreadySplit) {
    this._insert(rect);
    return;
  }

  // otherwise process queued objects
  this.split();
  this._insert(rect);
  while (this.objects.length > 0) {
    this._insert(this.objects.pop());
  }
}

Quadtree.prototype.query = function(rect, res) {
  if (res == null) { res = []; } else { res.length=0; }
  return this._query(rect, res);
}

Quadtree.prototype._query = function(rect, res) {
  if (this.nodes[0] != null) {
    var index = this.getIndex(rect);
    if (index != -1) {
      this.nodes[index]._query(rect, res);
    }
  }

  for (var i=0, ii=this.stuckObjects.length; i<ii; i++) {
    var o = this.stuckObjects[i];
    if (rect.entityId != o.entityId && intersects(rect, o)) {
      res.push(o);
    }
  }

  for (var i=0, ii=this.objects.length; i<ii; i++) {
    var o = this.objects[i];
    if (rect.entityId != o.entityId && intersects(rect, o)) {
      res.push(o);
    }
  }

  return res;
}

function intersects(a, b) {
  return !(a.x2 < b.x1 || b.x2 < a.x1 || a.y2 < b.y1 || b.y2 < a.y1);
}