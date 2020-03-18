import Vue from 'vue'
import WebMidi from 'webmidi'

const app = new Vue({
  el: '#app'
})

window.app = app
window.WebMidi = WebMidi
