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
    for (let url in this.assets) {
      const name = this.assets[url].name
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
          sprite.anchor.x = 0.5
          sprite.anchor.y = 0.5
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
    }
  }

  requestFullScreen() {
    const de = document.documentElement
    if (de.requestFullScreen) { de.requestFullScreen() }
    else if (de.webkitRequestFullScreen) { de.webkitRequestFullScreen() }
    else if (de.mozRequestFullScreen) { de.mozRequestFullScreen() }
    else if (de.msRequestFullScreen) { de.msRequestFullScreen() }
  }

  init(callback) {
    document.body.appendChild(this.renderer.view)

    window.addEventListener('resize', () => {
      this.dimensions.width = window.innerWidth,
      this.dimensions.height = window.innerHeight,
      this.renderer.resize(window.innerWidth, window.innerHeight)
    })

    var loader = PIXI.loader

    for (let url in this.assets) {
      const name = this.assets[url].name
      loader.add(name, url)
    }

    loader.once('complete', () => {
      this.initSprites()
      if (callback) { callback() }
    })
    loader.load()
  }
}
