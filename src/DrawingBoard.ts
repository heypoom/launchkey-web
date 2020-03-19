import {LaunchKey} from './LaunchKey'

import {LIGHT_BLUE, PINK, TEAL, WHITE} from './colors'

export class DrawingBoard extends LaunchKey {
  data: {[key: string]: number} = {}
  colors = [WHITE, PINK, TEAL, LIGHT_BLUE]

  constructor() {
    super()

    this.on('controlChange', (id, value) => {
      if (id === 59 && value === 127) this.reset()
    })

    this.on('padTouch', note => this.update(note))

    this.on('ready', () => this.reset())
  }

  reset() {
    this.clearLights()
    this.data = {}
  }

  update(note: number) {
    let color = this.data[note] || 0
    color = (color + 1) % this.colors.length
    this.data[note] = color

    let nextColor = this.colors[color]

    this.send(note, nextColor)
  }
}
