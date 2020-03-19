<template lang="pug">
  main
    .container
      .pads-container
        .pad(v-for="i in 18", :style="{background: colors[i]}", @click="tap(i)") {{i}}
</template>

<style lang="scss">
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #2d2d30;
}

.pads-container {
  display: grid;
  grid-template-rows: repeat(2, 100px);
  grid-template-columns: repeat(9, 100px);
  grid-gap: 15px 15px;
}

.pad {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #2d2d30;
  font-weight: 500;
  font-size: 2.5em;
  cursor: pointer;

  box-shadow: 4px 4px 4px rgba(255, 255, 255, 0.3);
}
</style>

<script lang="ts">
import Vue from 'vue'

import {DrawingBoard} from './DrawingBoard'
import {LaunchKey} from './LaunchKey'
import {colorMapping} from './colors'

let board: DrawingBoard

export default Vue.extend({
  data: () => ({
    colors: Array(18).fill('white'),
  }),

  methods: {
    tap(i) {
      let note = i + 95
      if (i > 9) note += 7
      console.log(this.app.update(note))
    },
  },

  async mounted() {
    const app = new DrawingBoard()
    await app.setup()
    this.app = app

    app.onClear = () => {
      this.colors = Array(18).fill('white')
    }

    app.onUpdate = (note, color) => {
      let position = note - 95
      if (position >= 17) position -= 7

      Vue.set(this.colors, position, colorMapping[color])

      console.log([...this.colors])
    }
  },
})
</script>