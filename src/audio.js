import { Howl } from 'howler'

export default class Audio {
  constructor(options = {}) {
    this.assets = options.assets || {}
    this.howls = {}
    this.currentTheme = null
  }

  setTheme(theme) {
    const prevTheme = this.currentTheme
    this.currentTheme = this.getAsset(theme)
    this.currentTheme.loop()
    this.currentTheme.volume(0)
    this.currentTheme.play()

    if (prevTheme) {
      prevTheme.fade(1, 0, 200).once('fade', () => { prevTheme.stop() })
      this.currentTheme.fade(0, 1, 200)
    } else {
      this.currentTheme.fade(0, 1, 200)
    }
  }

  getAsset(name) {
    if (!this.howls[name]) {
      this.howls[name] = new Howl(this.assets[name])
    }
    return this.howls[name]
  }
}

export const explosionSound = new Howl({
  src: ['assets/audio/explosion.wav'],
  volume: 1,
})

export const cannonSound = new Howl({
  src: ['assets/audio/gun-zap2.wav'],
  volume: 0.2,
})
