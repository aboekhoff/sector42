import Game from './tetryon2/game'
import Input from './tetryon2/input'
import Quadtree from './tetryon2/util/quadtree'
import Renderer from './renderer'
import Audio from './audio'
import TitleScreenState from './states/title_screen_state'

export const audioAssets = {
  to_eris: {
    src: ['assets/audio/themes/To_Eris_-_01_-_To_Eris.mp3'],
    loop: true,
    html5: true,
  },
  darkaround: {
    src: ['assets/audio/themes/To_Eris_-_04_-_Darkaround.mp3'],
    loop: true,
    html5: true,
  },
  almost_there: {
    src: ['assets/audio/themes/To_Eris_-_08_-_Almost_there.mp3'],
    html5: true,
    loop: true,
  },
  lights: {
    src: ['assets/audio/themes/To_Eris_-_10_-_Lights.mp3'],
    html5: true,
    loop: true,
  },
  moon_party: {
    src: ['assets/audio/themes/To_Eris_-_03_-_Moon_Party.mp3'],
    html5: true,
    loop: true,
  },
  regards_from_mars: {
    meeting_in_a_black_hole: ['assets/audio/themes/To_Eris_-_09_-_Meeting_in_a_black_hole.mp3'],
    html5: true,
    loop: true,
  },
  feet_on_the_ground: {
    src: ['assets/audio/themes/To_Eris_-_11_-_Feet_on_the_ground.mp3'],
    html5: true,
    loop: true,
  },
  ultraspeed: {
    src: ['assets/audio/themes/To_Eris_-_02_-_Ultraspeed.mp3'],
    html5: true,
    loop: true,
  }
}

export const graphicAssets = [
  {
    name: 'particle',
    url: 'assets/snow_particle.png'
  },
  {
    name: 'star',
    url: 'assets/snow_particle.png'
  },
  {
    name: 'boss',
    url: 'assets/spaceships/boss1.png',
  },
  {
    name: 'player',
    url: 'assets/spaceships/player_ship.png',
  },
  {
    name: 'enemy1',
    url: 'assets/spaceships/enemy_1.png',
  },
  {
    name: 'enemy2',
    url: 'assets/spaceships/enemy_2.png',
  },
  {
    name: 'enemy3',
    url: 'assets/spaceships/enemy_3.png',
  }
]

export const audioPlayer = window.audio = new Audio({assets: audioAssets})
export const renderer = window.renderer = new Renderer({assets: graphicAssets})
export const game = window.game = new Game()

export const world = {
  width: 20000,
  height: 20000,
  numStars: 8000,
}

export const qt = window.qt = Quadtree.create(world.width, world.height)

function init() {
  renderer.init(() => {
    game.pushState(new TitleScreenState())
    game.start()
  })
}

init()
