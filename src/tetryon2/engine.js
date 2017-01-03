import DB from './util/db'
import Bitset from './util/bitset'
import { compile } from './util/logic'

const SIZE = 32

export default class Engine {
  constructor(db=null) {
    this.initialized = false
    this.db = db || new DB()
    this.systems = []
  }

  addComponentType(componentType, poolSize=SIZE) {
    this.db.addComponentType(
      componentType,
      componentType.onCreate,
      componentType.onDispose,
      poolSize
    )
  }

  addSystem(system, priority=0, active=true) {
    system.active = active
    system.priority = priority
    this.systems.push(system)
  }

  addComponentTypes(...cts) {
    cts.forEach(ct => {
      this.addComponentType(ct)
    })
  }

  addSystems(...systems) {
    systems.forEach(sys => {
      this.addSystem(sys)
    })
  }

  runSystem(system) {
    if (!system.predicate) {
      system.run()
      return
    }

    const entities = this.db.query(system.predicate)

    if (system.before) {
      system.before()
    }

    if (system.all) {
      system.all(entities)
    }

    if (system.each) {
      for (let i=0; i<entities.length; i++) {
        system.each(entities.array[i])
      }
    }

    if (system.after) {
      system.after()
    }
  }

  runActiveSystems() {
    if (!this.initialized) {
      this.initialize()
    }

    for (let i=0; i<this.systems.length; i++) {
      const system = this.systems[i]
      if (system.active) { this.runSystem(system) }
    }
  }

  initialize() {
    // sort systems by priority

    this.systems.sort((a, b) => {
      const p1 = a.priority
      const p2 = b.priority
      return p1 > p2 ? -1 : p1 < p2 ? 1 : 0
    })

    // generate predicates for entity collection
    this.systems.forEach(system => {
      system.predicate = this.compilePredicate(system.dependencies)
    })

    this.initialized = true
  }

  compilePredicate(dependencies) {
    if (!dependencies) { return null }
    const key = this.db.key

    const toBitset = (x) => {
      if (x instanceof Bitset) { return x }
      if (x instanceof Function) { return (new Bitset()).mutatingSet(x[key])}
      throw Error('invalid type')
    }

    return compile(dependencies, toBitset)

  }

}
