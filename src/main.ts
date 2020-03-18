import Vue from 'vue'
import WebMidi, {Input, Output, INoteParam} from 'webmidi'

import {LIGHT_BLUE, PINK, TEAL, BRIGHT_WHITE} from './colors'

const enableMidi = () =>
  new Promise((resolve, reject) => {
    WebMidi.enable(err => {
      if (err) return reject(err)
      resolve()
    }, false)
  })

const app = new Vue({
  el: '#app',
})

class LaunchKey {
  midiIn: Input
  ctrlIn: Input
  ctrlOut: Output

  midiPort = 'Launchkey MK2 49 Launchkey MIDI'
  inControlPort = 'Launchkey MK2 49 Launchkey InControl'

  async setup() {
    await enableMidi()
    this.initPorts()
  }

  initPorts() {
    let midiIn = WebMidi.getInputByName(this.midiPort)
    if (!midiIn) return

    let ctrlIn = WebMidi.getInputByName(this.inControlPort)
    if (!ctrlIn) return

    let ctrlOut = WebMidi.getOutputByName(this.inControlPort)
    if (!ctrlOut) return

    this.midiIn = midiIn
    this.ctrlIn = ctrlIn
    this.ctrlOut = ctrlOut
  }

  send(note: INoteParam, velocity: number) {
    if (!this.ctrlOut) return
    if (velocity < 0 || velocity > 127) return

    this.ctrlOut.playNote(note, 16, {
      velocity,
      rawVelocity: true,
    })
  }

  light(pos: number, color: number) {
    this.send(pos + 95, color)
  }

  clearLights() {
    for (let note = 96; note <= 120; note++) {
      this.send(note, BRIGHT_WHITE)
    }
  }
}

async function main() {
  const board = new LaunchKey()
  await board.setup()
  window.board = board

  board.clearLights()

  let data: {[key: string]: number} = {}
  let colors = [PINK, TEAL, LIGHT_BLUE, BRIGHT_WHITE]

  board.midiIn.addListener('noteon', 'all', event => {
    console.log('Piano>', event.note.number, event.rawVelocity)
  })

  board.ctrlIn.addListener('noteon', 'all', event => {
    let note = event.note.number

    console.log('Pad>', event.note.number, event.rawVelocity)

    if (data[note] === undefined) data[note] = 0
    else data[note] = (data[note] + 1) % colors.length

    let velocity = colors[data[note]]
    board.send(note, velocity)
  })

  board.clearLights()
}

main()

window.app = app
window.WebMidi = WebMidi
