<template lang="pug">
  main
    .container
      h1.score
        div Score: {{score}}
      div
        button.play(v-if="!isPlaying", @click="play") Play
      .pads-container
        .pad(v-for="i in 18", :style="{background: colors[i]}", @click="tap(i)") {{i}}
</template>

<style lang="scss" scoped>
$button-size: 150px;
$gap-size: 20px;

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #2d2d30;
}

button.play {
  cursor: pointer;
  margin-bottom: 2em;
  padding: 0.5em 2em;
  font-size: 1.8em;
  background: transparent;
  color: #01dcfc;
  font-weight: 600;
  border: 3px solid #01dcfc;

  &:hover {
    color: white;
    border: 3px solid white;
  }
}

.score {
  color: white;
  font-size: 3em;
}

.pads-container {
  display: grid;
  grid-template-rows: repeat(2, $button-size);
  grid-template-columns: repeat(9, $button-size);
  grid-gap: $gap-size $gap-size;
}

.pad {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #2d2d30;
  font-weight: 600;
  font-size: 3em;
  cursor: pointer;

  box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.pad:nth-child(9),
.pad:nth-child(18) {
  width: 90px;
  height: 90px;
  border-radius: 10em;
  margin: 25px;
  font-size: 2.3em;
}
</style>

<script lang="ts">
import Vue from 'vue'

import {WhackAMole} from './WhackAMole'
import {colorMapping} from '../colors'

import {positionOf, noteOf} from './utils'

let INITIAL_BOARD = Array(18).fill('white')

export default Vue.extend({
  data: () => ({
    colors: INITIAL_BOARD,
    score: 0,
    isPlaying: false,
  }),

  methods: {
    tap(position) {
      this.board.hit(noteOf(position))
    },

    play() {
      this.board.startGame()
    },
  },

  async mounted() {
    const board = new WhackAMole()
    this.board = board
    window.board = board

    board.onScoreUpdate = score => {
      this.score = score
    }

    board.onStatusUpdate = isPlaying => {
      this.isPlaying = isPlaying
    }

    board.on('clear', () => {
      this.colors = INITIAL_BOARD
    })

    board.on('update', (note, color) => {
      let position = positionOf(note)

      Vue.set(this.colors, position, colorMapping[color])
    })
  },
})
</script>