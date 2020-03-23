<template lang="pug">
  main
    .container
      .pads-container
        .pad(v-for="i in 18", :style="{background: colors[i]}", @click="tap(i)") {{i}}
</template>

<style lang="scss" scoped>
$button-size: 150px;
$gap-size: 20px;

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #2d2d30;
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

import {DrawingBoard} from './DrawingBoard'

import {positionOf, noteOf} from './utils'

import {colorMapping} from '../colors'

let INITIAL_BOARD = Array(18).fill('white')

export default Vue.extend({
  data: () => ({
    colors: INITIAL_BOARD,
  }),

  methods: {
    tap(position) {
      this.board.update(noteOf(position))
    },
  },

  async mounted() {
    const board = new DrawingBoard()
    this.board = board

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