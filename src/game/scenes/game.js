import Geckos, { iceServers } from '@geckos.io/server'
import { Scene } from 'phaser'
import { map, pick, set, unset } from 'lodash/fp'
import { v4 as uuid } from 'uuid'
import Player from '../components/Player'
import Enemy from '../components/Enemy'

export default class GameScene extends Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.playerId = 0
    this.players = {}
    this.enemy = {}

    this.onConnectionHandler = this.onConnectionHandler.bind(this)
    this.onDisconnectHandler = this.onDisconnectHandler.bind(this)
    this.onPlayerAddHandler = this.onPlayerAddHandler.bind(this)
    this.onPlayerMoveHandler = this.onPlayerMoveHandler.bind(this)
    this.getPlayerUpdates = this.getPlayerUpdates.bind(this)
    this.getEnemyUpdates = this.getEnemyUpdates.bind(this)
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

    const id = uuid()
    const name = 'Big Baby'
    const hp = { red: 2 }
    const gameObject = new Enemy(this, id, name, hp)

    this.enemy = gameObject
  }

  update() {
    const players = this.players
    const updates = {
      players: this.getPlayerUpdates(players),
      enemy: this.getEnemyUpdates(),
    }

    if (updates.players.length > 0) {
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

  getPlayerUpdates(players) {
    return map(({ id, player }) => {
      const isDeltaX = Math.abs(player.x - player.prevX) > 0.5
      const isDeltaY = Math.abs(player.y - player.prevY) > 0.5

      if (isDeltaX || isDeltaY) {
        return { id, x: player.x, y: player.y }
      }
    })(players)
  }

  getEnemyUpdates() {
    return pick(['id', 'name', 'hp'])(this.enemy)
  }
}
