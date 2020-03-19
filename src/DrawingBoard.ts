import {LaunchKey} from './LaunchKey'

import {LIGHT_BLUE, PINK, TEAL, BRIGHT_WHITE} from './colors'

export class DrawingBoard {
  board: LaunchKey
  data: {[key: string]: number} = {}
  colors = [PINK, TEAL, LIGHT_BLUE, BRIGHT_WHITE]

  reset() {
    this.board.clearLights()
    this.data = {}
  }

  update(note: number) {
    let color = this.data[note] || 0
    color = (color + 1) % this.colors.length
    this.data[note] = color

    let nextColor = this.colors[color]

    this.board.send(note, nextColor)
  }

  async setup() {
    this.board = new LaunchKey()
    await this.board.setup()

    this.board.on('controlChange', (id, value) => {
      if (id === 59 && value === 127) this.reset()
    })

    this.board.on('padTouch', note => this.update(note))

    this.reset()
  }
}
