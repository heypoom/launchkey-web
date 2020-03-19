import Vue from 'vue'
import WebMidi from 'webmidi'

import Board from './Board.vue'

const app = new Vue({
  render: createElement => createElement(Board),
}).$mount('#app')

window.app = app
