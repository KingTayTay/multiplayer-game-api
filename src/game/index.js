import '@geckos.io/phaser-on-nodejs'
import { Game } from 'phaser'

import GameScene from './scenes/game'

const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-game',
  width: 896,
  height: 504,
  banner: false,
  audio: false,
  scene: [GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1200 },
    },
  },
}

export default class PhaserGame extends Game {
  constructor(server) {
    super(config)
    this.server = server
  }
}
