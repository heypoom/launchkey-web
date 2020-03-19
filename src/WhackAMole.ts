import {LaunchKey} from './LaunchKey'

import {LIGHT_BLUE, PINK, TEAL, WHITE, RED, GREEN, LIGHT_TEAL} from './colors'
import {positionOf} from './utils'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export class WhackAMole extends LaunchKey {
  colors = [WHITE, PINK, TEAL, LIGHT_BLUE]

  state = Array(17).fill(false)
  decayState = Array(17).fill(0)

  config = {
    decayTime: () => Math.floor(Math.random() * 30) + 10,
    moleChance: 0.01,
    gameTick: 200,
  }

  isPlaying = true
  score = 0

  onScoreUpdate = (score: number) => {}

  constructor() {
    super()

    this.on('controlChange', (id, value) => {
      if (id === 59 && value === 127) {
        this.isPlaying ? this.endGame() : this.startGame()
      }
    })

    this.on('padTouch', note => this.hit(note))

    this.on('ready', () => this.startGame())
  }

  addMole(position: number) {
    if (Math.random() > this.config.moleChance) return

    let color = LIGHT_BLUE
    this.state[position] = true
    this.light(position, color)

    let decayTime = this.config.decayTime()
    this.decayState[position] = decayTime

    console.log(`Mole added at ${position}`)
  }

  processBlock(position: number) {
    this.processDecay(position)
    this.addMole(position)
  }

  resetBlock(position: number, color: number = WHITE) {
    this.decayState[position] = 0
    this.state[position] = false
    this.light(position, color)

    if (color !== WHITE) {
      setTimeout(() => this.light(position, WHITE), 150)
    }
  }

  processDecay(position: number) {
    // Missed the mole.
    if (this.decayState[position] === 1) {
      this.resetBlock(position, RED)

      this.updateScore(-1)

      console.log(
        `Whoops! You missed the mole at ${position}. Score = ${this.score}`,
      )
    } else if (this.decayState[position] > 1) {
      this.decayState[position] -= 1
    }
  }

  async startGame() {
    this.clearLights()
    this.isPlaying = true

    console.log('Go!')

    // Game Loop.
    while (true) {
      for (let i = 1; i <= 8; i++) this.processBlock(i)
      for (let i = 10; i <= 17; i++) this.processBlock(i)

      await delay(this.config.gameTick)

      if (!this.isPlaying) break
    }
  }

  endGame() {
    this.isPlaying = false
    this.clearLights()
  }

  hit(note: number) {
    const position = positionOf(note)

    if (!this.state[position]) {
      this.updateScore(-1)
      this.resetBlock(position, RED)

      console.log(
        `Whoops! There is no mole at ${position}. Score = ${this.score}`,
      )

      return
    }

    console.log(`Whacked mole at ${position}!`)

    this.updateScore(1)
    this.resetBlock(position, LIGHT_TEAL)
  }

  updateScore(addBy = 1) {
    this.score += addBy
    this.onScoreUpdate(this.score)
  }
}
