import Bitset from './bitset'

class LogicalExpression {
  constructor(op, exprs) {
    this.op = op 
    this.exprs = exprs
  }
}

export const or = (...exprs) => {
  return new LogicalExpression('OR', exprs)
}

export const and = (...exprs) => {
  return new LogicalExpression('AND', exprs)
}

export const not = (...exprs) => {
  return new LogicalExpression('NOT', exprs)
}

export const compile = (x, toBitset) => {

  const normalize = (x) => {
    if (x instanceof LogicalExpression) {
      return new LogicalExpression(x.op, x.exprs.map(normalize))
    }

    if (x instanceof Array) {
      return new LogicalExpression('AND', x.map(normalize))
    }
  
    else {
      return toBitset(x)
    }

  }

  const compress = (x) => {
    let mask = new Bitset()
    const next = [];

    for (let i=0; i<x.exprs.length; i++) {
      const expr = x.exprs[i]
      
      if (expr instanceof Bitset) {
        mask = mask.or(expr)
      }

      else {
        next.push(expr)
      }
    }

    return new LogicalExpression(
      x.op,
      [mask].concat(next)
    )
  }

  const compile = (x) => {
    switch(x.op) {
      case 'AND': return compileAnd(x.exprs)
      case 'OR':  return compileOr(x.exprs)
      case 'NOT': return compileNot(x.exprs)
    }
  }


  const compileAnd = (exprs) => {
    const fns = exprs.map((x) => {
      if (x instanceof Bitset) {
        return (mask) => x.allIn(mask)
      } else {
        return compile(x)
      }
    })

    return (mask) => {
      for (let i=0; i<fns.length; i++) {
        if (!fns[i](mask)) { return false; }
      }
      return true;
    }
  }

  const compileOr = (exprs) => {
    const fns = exprs.map((x) => {
      if (x instanceof Bitset) {
        return (mask) => x.allIn(mask)
      } else {
        return compile(x)
      }
    })

    return function(mask) {
      for (var i=0; i<fns.length; i++) {
        if (fns[i](mask)) { return true; }
      }
      return false;
    }
  }

  const compileNot = (exprs) => {
    const x = exprs[0]
    if (x instanceof Bitset) {
      return (mask) => { return !x.allIn(mask) }
    }
    else {
      const fn = compile(x)
      return (mask) => { return !fn(mask) }
    }
  }

  const x1 = normalize(x)
  const x2 = compress(x1)
  const x3 = compile(x2)
  return x3

}

