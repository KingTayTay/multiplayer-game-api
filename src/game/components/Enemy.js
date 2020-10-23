import { Physics } from 'phaser'

export default class Player extends Physics.Arcade.Sprite {
  constructor(scene, id, name, hp, x = 200, y = 200) {
    super(scene, x, y, '')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.scene = scene
    this.body.setSize(32, 48)
    this.body.setEnable(false)

    scene.events.on('update', this.update, this)
  }
}
