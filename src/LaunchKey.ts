import WebMidi, {Input, Output, INoteParam} from 'webmidi'

import {BRIGHT_WHITE} from './colors'

export const enableMidi = () =>
  new Promise((resolve, reject) => {
    WebMidi.enable(err => {
      if (err) return reject(err)
      resolve()
    }, false)
  })

type KeyHandler = (note: number, velocity: number) => void

type KeyListeners = {
  controlChange: KeyHandler[]

  padTouch: KeyHandler[]
  padRelease: KeyHandler[]

  noteActive: KeyHandler[]
  noteRelease: KeyHandler[]

  update: KeyHandler[]
  clear: KeyHandler[]
}

export class LaunchKey {
  midiIn: Input
  ctrlIn: Input
  ctrlOut: Output

  midiPort = 'Launchkey MK2 49 Launchkey MIDI'
  inControlPort = 'Launchkey MK2 49 Launchkey InControl'

  initialized = false

  listeners: KeyListeners = {
    controlChange: [],
    padTouch: [],
    padRelease: [],
    noteActive: [],
    noteRelease: [],
    update: [],
    clear: [],
  }

  on(event: keyof KeyListeners, handler: KeyHandler) {
    if (!this.listeners[event]) return

    this.listeners[event].push(handler)
  }

  dispatch(event: keyof KeyListeners, note: number, velocity: number) {
    if (!this.listeners[event]) return

    console.debug(`event ${event}>`, note, velocity)

    for (let listener of this.listeners[event]) {
      listener(note, velocity)
    }
  }

  async setup() {
    if (this.initialized) return

    await enableMidi()
    this.initPorts()
    this.enableExtendedMode()
    this.setupListeners()

    this.initialized = true
  }

  setupListeners() {
    this.midiIn.addListener('noteon', 'all', event => {
      this.dispatch('noteActive', event.note.number, event.rawVelocity)
    })

    this.midiIn.addListener('noteoff', 'all', event => {
      this.dispatch('noteRelease', event.note.number, event.rawVelocity)
    })

    this.ctrlIn.addListener('controlchange', 'all', event => {
      const {value, controller} = event
      const id = controller.number

      this.dispatch('controlChange', id, value)
    })

    this.ctrlIn.addListener('noteon', 'all', event => {
      let note = event.note.number
      if (note < 95) return

      this.dispatch('padTouch', note, event.rawVelocity)
    })

    this.ctrlIn.addListener('noteoff', 'all', event => {
      let note = event.note.number
      if (note < 95) return

      this.dispatch('padRelease', note, event.rawVelocity)
    })
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

  enableExtendedMode() {
    this.send(12, 127)
  }

  send(note: number, velocity: number) {
    if (!this.ctrlOut) return
    if (velocity < 0 || velocity > 127) return

    if (note >= 95) this.dispatch('update', note, velocity)

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

    this.dispatch('clear', 0, 0)
  }
}
