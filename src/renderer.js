import PIXI from 'pixi.js'
import ObjectPool from './tetryon2/util/object_pool'

export default class Renderer {
  constructor(options={}) {
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    this.renderer = new PIXI.autoDetectRenderer(
      this.dimensions.width,
      this.dimensions.height, {
        backgroundColor: 0x000000,
        antialias: true
      }
    )

    this.stage = new PIXI.Container()
    this.sprites = {}
    this.particleContainers = {}
    this.assets = options.assets || {}
  }

  render() {
    this.renderer.render(this.stage)
  }

  initSprites() {
    this.assets.forEach(({name, url}) => {
      const texture = PIXI.loader.resources[name].texture
      const pc = this.particleContainers[name] = new PIXI.ParticleContainer(
        15000,
        { scale: true, position: true, rotation: true },
        15000
      )
      this.stage.addChild(pc)
      const key = '_tetryon_sprite_id'
      this.sprites[name] = new ObjectPool({
        key,
        allocate: (i) => {
          const sprite = new PIXI.Sprite(texture)
          sprite.scale.x = 0
          sprite.scale.y = 0
          sprite[key] = i
          pc.addChild(sprite)
          return sprite
        },
        dispose: (sprite) => {
          sprite.scale.x = 0
          sprite.scale.y = 0
        }
      })
    })
  }

  requestFullScreen() {
    const de = document.documentElement
    if (de.requestFullScreen) { de.requestFullScreen() }
    else if (de.webkitRequestFullScreen) { de.webkitRequestFullScreen() }
    else if (de.mozRequestFullScreen) { de.mozRequestFullScreen() }
    else if (de.msRequestFullScreen) { de.msRequestFullScreen() }
  }

  resize() {
    const { innerWidth, innerHeight } = window
    this.dimensions.width = innerWidth,
    this.dimensions.height = innerHeight,
    this.renderer.resize(innerWidth, innerHeight)
    this.stage.position.x = innerWidth / 2
    this.stage.position.y = innerHeight / 2
  }

  init(callback) {
    // this.renderer.roundPixels = true
    document.body.appendChild(this.renderer.view)
    window.addEventListener('resize', this.resize.bind(this))
    this.resize()

    var loader = PIXI.loader

    this.assets.forEach(({name, url}) => {
      console.log(name, url)
      loader.add(name, url)
    })

    loader.once('complete', () => {
      this.initSprites()
      if (callback) { callback() }
    })
    loader.load()
  }
}
