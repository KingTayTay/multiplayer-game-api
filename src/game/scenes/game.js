import Geckos, { iceServers } from '@geckos.io/server'
import { Scene } from 'phaser'
import { map, set, unset } from 'lodash/fp'
import { v4 as uuid } from 'uuid'
import Player from '../components/Player'

export default class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.playerId = 0
    this.players = {}

    this.onConnectionHandler = this.onConnectionHandler.bind(this)
    this.onDisconnectHandler = this.onDisconnectHandler.bind(this)
    this.onPlayerAddHandler = this.onPlayerAddHandler.bind(this)
    this.onPlayerMoveHandler = this.onPlayerMoveHandler.bind(this)
    this.getUpdates = this.getUpdates.bind(this)
  }

  // Lifecycle

  init() {
    this.io = Geckos({
      iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
    })
    this.io.addServer(this.game.server)
  }

  create() {
    this.io.onConnection(this.onConnectionHandler)
  }

  update() {
    const players = this.players
    const updates = this.getUpdates(players)

    if (updates.length > 0) {
      this.io.room().emit('SERVER_UPDATE', updates)
    }
  }

  onConnectionHandler(channel) {
    const id = uuid()
    console.log('Connect user', channel.id, id)

    channel.onDisconnect(this.onDisconnectHandler(channel, id))
    channel.on('PLAYER_ADD', this.onPlayerAddHandler(channel, id))
    channel.on('PLAYER_MOVE', this.onPlayerMoveHandler(channel, id))

    channel.emit('ready')
  }

  onDisconnectHandler(channel, id) {
    return () => {
      console.log('Disconnect user', channel.id, id)

      this.players = unset(channel.id)(this.players)
      channel.emit('SERVER_UPDATE_PLAYER_REMOVED', { id })
    }
  }

  onPlayerAddHandler(channel, id) {
    return () => {
      console.log('PLAYER_ADD handler', channel.id, id)
      const player = new Player(this, id, Phaser.Math.RND.integerInRange(100, 700))
      const playerStore = { id, channelId: channel.id, player }

      this.players = set(channel.id, playerStore)(this.players)
      channel.emit('SERVER_UPDATE_PLAYER_ADDED', id)
    }
  }

  onPlayerMoveHandler(channel, id) {
    return ({ x, y }) => {
      console.log('PLAYER_MOVE handler', channel.id, id, x, y)
      const playerStore = this.players[channel.id]

      if (!playerStore) {
        return
      }

      const { player } = playerStore

      player.moveX = x
      player.moveY = y
    }
  }

  getUpdates(players) {
    return map(({ id, player }) => {
      const isDeltaX = Math.abs(player.x - player.prevX) > 0.5
      const isDeltaY = Math.abs(player.y - player.prevY) > 0.5

      if (isDeltaX || isDeltaY) {
        return { id, x: player.x, y: player.y }
      }
    })(players)
  }
}
