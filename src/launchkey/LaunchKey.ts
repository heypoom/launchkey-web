import WebMidi, {Input, Output, INoteParam} from 'webmidi'

import {WHITE} from '../colors'
import {noteOf} from './utils'

export const enableMidi = () =>
  new Promise((resolve, reject) => {
    WebMidi.enable(err => {
      if (err) return reject(err)
      resolve()
    }, false)
  })

type KeyHandler = (note: number, velocity: number) => void

type KeyEvents =
  | 'controlChange'
  | 'padTouch'
  | 'padRelease'
  | 'noteActive'
  | 'noteRelease'
  | 'update'
  | 'clear'
  | 'ready'

type KeyListeners = Record<KeyEvents, KeyHandler[]>

function inputOf(name) {
  const inPort = WebMidi.getInputByName(name)
  if (inPort) return inPort
}

function outputOf(name) {
  const outPort = WebMidi.getOutputByName(name)
  if (outPort) return outPort
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
    ready: [],
  }

  constructor() {
    this.setup()
  }

  on(event: keyof KeyListeners, handler: KeyHandler) {
    if (!this.listeners[event]) return

    this.listeners[event].push(handler)
  }

  dispatch(event: keyof KeyListeners, note: number = 0, velocity: number = 0) {
    if (!this.listeners[event]) return

    console.debug(`${event}>`, note, velocity)

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
    this.dispatch('ready')

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
    this.midiIn = inputOf(this.midiPort)
    this.ctrlIn = inputOf(this.inControlPort)
    this.ctrlOut = outputOf(this.inControlPort)
  }

  enableExtendedMode() {
    this.send(12, 127)
  }

  send(note: number, velocity: number) {
    if (!this.ctrlOut) return
    if (velocity < 0 || velocity > 127) return

    if (note > 95) this.dispatch('update', note, velocity)

    this.ctrlOut.playNote(note, 16, {
      velocity,
      rawVelocity: true,
    })
  }

  light(position: number, color: number) {
    let note = noteOf(position)

    this.send(note, color)
  }

  clear() {
    for (let note = 96; note <= 120; note++) {
      this.send(note, WHITE)
    }

    this.dispatch('clear')
  }
}
