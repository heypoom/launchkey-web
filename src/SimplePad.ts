import {LaunchKey} from './LaunchKey'

import {LIGHT_BLUE, PINK, TEAL, BRIGHT_WHITE} from './colors'

export async function SimplePad() {
  const board = new LaunchKey()
  await board.setup()

  console.log('> Simple Pad')

  board.on('padTouch', note => board.send(note, LIGHT_BLUE))
  board.on('padRelease', note => board.send(note, BRIGHT_WHITE))

  board.clearLights()
}
