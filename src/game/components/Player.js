import { Physics } from 'phaser'

export default class Player extends Physics.Arcade.Sprite {
  constructor(scene, id, x = 200, y = 200, dummy = false) {
    super(scene, x, y, '')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.scene = scene

    this.prevX = -1
    this.prevY = -1

    this.id = id
    this.moveX = 0
    this.moveY = 0

    this.body.setSize(32, 48)

    this.setCollideWorldBounds(true)

    scene.events.on('update', this.update, this)
  }

  update() {
    if (this.moveX > 0) {
      this.setVelocityX(160)
    } else if (this.moveX < 0) {
      this.setVelocityX(-160)
    } else {
      this.setVelocityX(0)
    }
    // if (this.move.left) this.setVelocityX(-160)
    // else if (this.move.right) this.setVelocityX(160)
    // else this.setVelocityX(0)

    // if (this.move.up && this.body.onFloor()) this.setVelocityY(-550)

    // this.setVelocityX(160)
  }
}
