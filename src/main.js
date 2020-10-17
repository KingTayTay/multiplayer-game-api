import express from 'express'
import http from 'http'
import compression from 'compression'

import Game from './game'

const port = 1444
const app = express()
const server = http.createServer(app)
const game = new Game(server)

app.use(compression())

app.get('/state', (req, res) => {
  try {
    const gameScene = game.scene.keys.GameScene
    return res.json({ state: gameScene.getState() })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

server.listen(port, () => {
  console.log('Express is listening on http://localhost:' + port)
})

export default server
