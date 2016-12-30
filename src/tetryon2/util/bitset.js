export default function Bitset(array) {
  this.array = array || [0]
  this.string = null;
}

Bitset.prototype.toString = function() {
  if (!this.string) {
    var r = [];
    for (var i=this.array.length-1; i>=0; i--) {
      var n = this.array[i];
      for (var j=31; j>=0; j--) {
        r.push((n >>> j) & 1);
      }
    } 
    while(r.length) {
      if (r[0] == 0) { r.shift(); }
      else { break; }
    }

    if (r.length == 0) {
      r = [0];
    }

    this.string = r.join("");
  }

  return this.string; 
}

Bitset.map = function(a, op) {
  var res = [];
  var aa = a.array;
  for (var i=0, ii=aa.length; i<ii; i++) {
    res.push(op(aa[i]));
  }
  return new Bitset(res);
}

Bitset.map2 = function(a, b, op) {
  var res = [];
  var aa = a.array;
  var bb = b.array;
  var n = Math.max(aa.length, bb.length);
  for (var i=0; i<n; i++) {
    var aan = (aa.length < i-1) ? 0 : aa[i];
    var bbn = (bb.length < i-1) ? 0 : bb[i];
    res.push(op(aan, bbn));
  }
  return new Bitset(res);
}

Bitset.defineUnaryOperator = function(name, op) {
  Bitset[name] = function(a) {return Bitset.map(a, op)};
  Bitset.prototype[name] = function() {return Bitset.map(this, op)}
}

Bitset.defineBinaryOperator = function(name, op) {
  Bitset[name] = function (a, b) {return Bitset.map2(a, b, op);}
  Bitset.prototype[name] = function(b) {return Bitset.map2(this, b, op);}
}

Bitset.defineUnaryOperator('not', function(a) {return ~a});
Bitset.defineBinaryOperator('and', function(a, b) {return a & b});
Bitset.defineBinaryOperator('or', function(a, b) {return a | b});
Bitset.defineBinaryOperator('xor', function(a, b) {return a ^ b});

Bitset.nth = function(a, n) {
  var index = Math.floor(n/32);
  if (index > a.array.length) {
    return 0;
  }
  else {
    var shift = n%32;
    return (a.array[index] >>> shift) & 1; 
  }
}

Bitset.prototype.nth = function(n) {
  return Bitset.nth(this, n);
}

Bitset.set = function(a, n) {
  var res = [];
  var index = Math.floor(n/32);
  var offset = n % 32;

  for (var i=0; i<=index; i++) {
    var m = a.array[i];
    res.push(i == index ? m | (1<<offset) : m);
  }

  return new Bitset(res);
}

Bitset.prototype.set = function(n) {
  return Bitset.set(this, n);
}

Bitset.mutatingSet = function(a, n) {
  var index = Math.floor(n/32);
  var offset = n % 32;

  for (var i=0; i<=index; i++) {
    if (i == index) { 
      a.array[i] = a.array[i] | (1<<offset);
      break; 
    }
  }

  return a;

}

Bitset.prototype.mutatingSet = function(n) {
  return Bitset.mutatingSet(this, n);
}

Bitset.unset = function(a, n) {
  var res = [];
  var index = Math.floor(n/32);
  var offset = n % 32;

  for (var i=0; i<=index; i++) {
    var m = a.array[i];
    res.push(index == i ? m & ~(1<<offset) : m)
  }

  return new Bitset(res);
}

Bitset.prototype.unset = function(n) {
  return Bitset.unset(this, n);
}

Bitset.mutatingUnset = function(a, n) {
  var index = Math.floor(n/32);
  var offset = n % 32;

  for (var i=0; i<=index; i++) {
    if (i == index) {
      var m = a.array[i];
      a.array[i] = a.array[i] & ~(1<<offset);
    }
  }

  return this;
}

Bitset.prototype.mutatingUnset = function(n) {
  return Bitset.mutatingUnset(this, n);
}

Bitset.mutatingReset = function(a) {
  for (var i=0, ii=a.array.length; i<ii; i++) {
    a.array[i] = 0;
  }
  return a;
}

Bitset.prototype.mutatingReset = function() {
  Bitset.mutatingReset(this);
}

Bitset.eachSetBitIndex = function(bitset, callback) {
  var arr = bitset.array;
  for (var i=0, ii=arr.length; i<ii; i++) {
    var mask = arr[i];
    var index = i * 32;
    while(mask) {
      if (mask & 1) {
        callback(index);
      }
      mask = mask >>> 1;
      index++;
    }
  }
};

Bitset.prototype.eachSetBitIndex = function(callback) {
  return Bitset.eachSetBitIndex(this, callback);
}

Bitset.isEmpty = function(a) {
  for (var i=0, ii=a.array.length; i<ii; i++) {
    if (a.array[i] != 0) { return false; }
  }
  return true;
}

Bitset.prototype.isEmpty = function() {
  return Bitset.isEmpty(this);
}

// test if every set bit in a is also set in b
Bitset.allIn = function(a, b) {
  var aa = a.array;
  var bb = b.array;
  var n = Math.max(aa.length, bb.length);
  for (var i=0; i<n; i++) {
    var aan = (aa.length < i-1) ? 0 : aa[i];
    var bbn = (bb.length < i-1) ? 0 : bb[i];  
    if ((aan & bbn) != aan) { return false; }
  }
  return true;
}

Bitset.prototype.allIn = function(b) {
  return Bitset.allIn(this, b);
}

// test if any bit set in a is also set in b
Bitset.anyIn = function(a, b) {
  var aa = a.array;
  var bb = b.array;
  var n = Math.max(aa.length, bb.length);
  for (var i=0; i<n; i++) {
    var aan = (aa.length < i-1) ? 0 : aa[i];
    var bbn = (bb.length < i-1) ? 0 : bb[i];
    if (aan & bbn) { return true; }
  }
  return false;
}

Bitset.prototype.anyIn = function(b) {
  return Bitset.anyIn(this, b);
}