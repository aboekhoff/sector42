import ObjectPool from './object_pool'
import Bitset from './bitset'
import FixedArray from './fixed_array'

const DEFAULT_SIZE = 1024

let _uid = 1

export default class DB {
  constructor(entityPoolSize) {
    this.entityPoolSize = entityPoolSize || DEFAULT_SIZE
    this.entityArray = new FixedArray(entityPoolSize)

    const key = this.key = "_db" + _uid
    _uid += 1

    const db = this

    this.nextEntityUID = 0;

    this.Entity = class Entity {
      constructor(id) {
        if (this.id == null) { this.id = id }
        if (this.mask == null) {
          this.mask = new Bitset()
        } else {
          this.mask.mutatingReset()
        }
      }

      get(componentType) {
        const index = componentType[key]
        const pool = db.componentTypePools[index]
        return pool.get(this.id)
      }

      set(componentType, ...params) {
        const index = componentType[key]
        const pool = db.componentTypePools[index]
        const component = pool.create(this.id, ...params)
        this.mask.mutatingSet(index)
        return this
      }

      remove(componentType) {
        const index = componentType[key]
        const pool = db.componentTypePools[index]
        pool.dispose(this.id)
        return this
      }

      dispose() {
        this.mask.eachSetBitIndex((index) => {
          const pool = db.componentTypePools[index]
          pool.dispose(this.id)
        })
        db.entityPool.dispose(this.id)
      }

    }

    this.entityPool = new ObjectPool({
      allocate(id) { return new db.Entity(id) },
      customize(instance) { instance.uid = db.nextEntityUID++ },
      poolSize: db.entityPoolSize,
      indexSize: db.entityPoolSize,
      key: 'id'
    })

    this.componentTypes = []
    this.componentTypePools = []

  }

  addComponentType(componentType, onCreate, onDispose, poolSize=32) {
    if (this.componentTypes.indexOf(componentType) != -1) {
      return
      console.log(`WARNING: ${componentType.name} has already been added to database`)
    }

    const index = this.componentTypes.length

    componentType[this.key] = index
    this.componentTypes.push(componentType)
    this.componentTypePools.push(new ObjectPool({
      allocate(_) { return new componentType() },
      customize(instance, eid, ...params) {
        componentType.apply(instance, params)
        instance.eid = eid
        if (onCreate) { onCreate(instance) }
      },
      dispose: onDispose,
      key: 'eid',
      poolSize: poolSize,
      indexSize: this.entityPoolSize,
    }))

  }

  entity(id=null) {
    if (id==null) {
      return this.entityPool.create()
    } else {
      return this.entityPool.get(id)
    }
  }

  query(predicate) {
    const pool = this.entityPool.pool
    const marker = this.entityPool.marker
    const out = this.entityArray

    out.length = 0

    for (let i=0; i<marker; i++) {
      const entity = pool[i]
      if (predicate(entity.mask)) {
        out.push(entity)
      }
    }

    // out.clear()

    return out

  }

  all() {
    return this.query(() => true)
  }

}
