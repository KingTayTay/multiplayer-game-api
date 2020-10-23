import '@geckos.io/phaser-on-nodejs'
import { Game } from 'phaser'

import GameScene from './scenes/game'

const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-game',
  width: 414,
  height: 736,
  banner: false,
  audio: false,
  scene: [GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    },
  },
}

export default class PhaserGame extends Game {
  constructor(server) {
    super(config)
    this.server = server
  }
}
