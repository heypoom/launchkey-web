<template lang="pug">
  div.backdrop
    div.container
      h1
        div Frame {{frameID}} | Frames: {{frames.length}}
      .toolbar
        button(@click="prevFrame") ⏪
        button.play(@click="play") ⏯
        button(@click="nextFrame") ⏩
      .pads-container
        .pad(v-for="i in 64", :style="{background: colors[i]}", @click="tap(i)") {{i}}
</template>
<style lang="scss" scoped>
$button-size: 100px;
$gap-size: 20px;
$grid-size: 8;
$font-size: 2.3em;

.backdrop {
  color: white;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #2d2d30;
}

.toolbar button {
  cursor: pointer;
  padding: 10px 50px;
  font-size: 2.5em;
  background: transparent;
  color: #01dcfc;
  font-weight: 600;
  border: none;
  margin: 30px 50px;
}

.pads-container {
  display: grid;
  grid-template-rows: repeat($grid-size, $button-size);
  grid-template-columns: repeat($grid-size, $button-size);
  grid-gap: $gap-size $gap-size;
}

.pad {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #2d2d30;
  font-weight: 600;
  font-size: $font-size;
  cursor: pointer;

  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}
</style>
<script lang="ts">
import Vue from 'vue'

import {LaunchPadX, RGB} from './LaunchPad'

const pad = new LaunchPadX()

const R = [3, 127, 0, 0]
const W = [3, 127, 127, 127]
const B = [3, 0, 0, 127]

const flag = [
  [R, R, R, R, R, R, R, R],
  [W, W, W, W, W, W, W, W],
  [B, B, B, B, B, B, B, B],
  [B, B, B, B, B, B, B, B],
  [B, B, B, B, B, B, B, B],
  [B, B, B, B, B, B, B, B],
  [W, W, W, W, W, W, W, W],
  [R, R, R, R, R, R, R, R],
]

const rotate = (list, n) => list.slice(n, list.length).concat(list.slice(0, n))

function posOf(n: number) {
  let x = (n % 8) - 1
  if (x === -1) x = 7

  let y = Math.max(Math.ceil(n / 8) - 1, 0)

  return [x, y]
}

window.posOf = posOf

function animateSlideUp(frame) {
  const frames = []

  for (let i = 0; i < frame.length; i++) {
    frames.push(rotate(frame, i))
  }

  return frames
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// let specs = []
// for (let i = 11; i <= 98; i++) specs.push(RGB(i, 127, i, i + 3))
// pad.bulk(specs)

// animate(0)

const frameAnimator = Vue.extend({
  data: () => ({
    frameID: 0,
    state: {},
    colors: {},
    frames: [],
    isPlaying: false,

    palette: [
      [255, 255, 255],
      [0, 255, 247],
      [255, 0, 157],
    ],

    webPalette: ['white', '#01dcfc', '#ff7ef8'],
  }),

  mounted() {
    window.loadFrames = (frames: string) => {
      this.frames = JSON.parse(frames)
      window.frames = this.frames

      this.frameID = this.frames.length - 1

      this.rerender()
    }

    pad.on('ready', () => {
      window.pad = pad
      window.animator = this

      this.clear()

      pad.on('padTouch', (n, v) => this.updateBlock(n, v))

      this.setupButtons()
    })
  },

  methods: {
    updateDisplay: function(note: number, color: number) {
      if (!color) return

      const pos = pad.midiToGridMap[note]
      if (typeof pos !== 'number') return

      Vue.set(this.colors, pos, this.webPalette[color] || 'white')
    },

    prevFrame() {
      if (this.frameID === 0) return
      this.frameID--

      this.rerender()
    },

    reset() {
      this.frames = []
      this.frameID = 0

      this.clear()
      this.rerender()
    },

    nextFrame() {
      this.frameID++

      if (!this.frames[this.frameID]) {
        this.frames = [...this.frames, {...this.state}]
        this.frameID = this.frames.length - 1
        window.frames = this.frames

        return
      }

      this.rerender()
    },

    renderOnScreen(frame: number[]) {
      for (let row of pad.midiGrid) {
        for (let note of row) {
          this.colors[note] = '#ffffff'
        }
      }

      for (let note in frame) {
        let color = this.state[note]

        this.updateDisplay(Number(note), color)
      }
    },

    renderOnDevice(frame: number[]) {
      const specs = []

      for (let note in frame) {
        const cid = frame[note]
        if (typeof cid !== 'number') continue

        const [r, g, b] = this.palette[cid]

        specs.push(RGB(Number(note), r, g, b))
      }

      pad.bulk(specs)
    },

    rerender() {
      console.log(`Rendering Frame> ${this.frameID}`)

      let frame = this.frames[this.frameID]
      if (!frame) return

      this.state = frame
      window.frame = frame

      this.renderOnScreen(frame)
      this.renderOnDevice(frame)
    },

    tap(i) {
      const [x, y] = posOf(i)
      const note = pad.midiGrid[y][x]

      this.updateBlock(note, 0)
    },

    clear() {
      pad.clear()

      this.state = {}
      this.colors = {}

      this.useBlankFrame()
    },

    useBlankFrame() {
      for (let row of pad.midiGrid) {
        for (let note of row) {
          this.state[note] = 0
          this.colors[note] = '#ffffff'
        }
      }

      window.frame = this.state
    },

    play(frame: number) {
      if (this.isPlaying) {
        this.isPlaying = false

        return
      }

      this.isPlaying = true

      if (this.frames.length < 2) return

      this.clear()

      const animate = async () => {
        this.clear()

        for (let fid in this.frames) {
          if (!this.isPlaying) return

          this.frameID = fid
          this.rerender()

          await delay(100)
        }

        window.requestAnimationFrame(animate)
      }

      animate()
    },

    updateBlock(note: number, velocity: number) {
      const state = this.state

      const color = ((state[note] || 0) + 1) % this.palette.length
      state[note] = color

      const [r, g, b] = this.palette[color]
      pad.rgb(note, r, g, b)

      this.state = state
      this.updateDisplay(note, color)

      window.frame = state
      window.webPalette = this.webPalette
    },

    setupButtons() {
      let PREV_FRAME_BTN = 93
      let NEXT_FRAME_BTN = 94
      let PLAY_BTN = 98
      let RESET_BTN = 39
      let CLEAR_BTN = 49

      pad.rgb(PREV_FRAME_BTN, 0, 255, 247)
      pad.rgb(NEXT_FRAME_BTN, 0, 255, 247)
      pad.rgb(PLAY_BTN, 161, 252, 3)
      pad.rgb(RESET_BTN, 252, 123, 3)
      pad.rgb(CLEAR_BTN, 252, 123, 3)

      pad.on('controlChange', (id, v) => {
        if (id === RESET_BTN) {
          if (v === 0) return pad.rgb(RESET_BTN, 252, 123, 3)
        }

        if (id === CLEAR_BTN) {
          if (v === 0) return pad.rgb(CLEAR_BTN, 252, 123, 3)
          this.clear()
        }

        if (id === PREV_FRAME_BTN) {
          if (v === 0) return pad.rgb(PREV_FRAME_BTN, 0, 255, 247)
          this.prevFrame()
        }

        if (id === NEXT_FRAME_BTN) {
          if (v === 0) return pad.rgb(NEXT_FRAME_BTN, 0, 255, 247)
          this.nextFrame()
        }

        if (id === PLAY_BTN) {
          if (v === 0) return pad.rgb(PLAY_BTN, 161, 252, 3)
          this.play()
        }

        pad.rgb(id, 255, 0, 157)
      })
    },
  },
})

window.RGB = RGB

export default frameAnimator
</script>