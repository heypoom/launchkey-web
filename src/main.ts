import Vue from 'vue'
import VueRouter from 'vue-router'

import App from './App.vue'
import Dashboard from './Dashboard.vue'

import LKDrawingBoard from './launchkey/DrawingBoard.vue'
import LKWhackAMole from './launchkey/WhackAMole.vue'

import LPAnimator from './launchpad/Animator.vue'

Vue.use(VueRouter)

const routes = [
  {path: '/', component: Dashboard},
  {path: '/launchkey/drawing', component: LKDrawingBoard},
  {path: '/launchkey/mole', component: LKWhackAMole},
  {path: '/launchpad/animator', component: LPAnimator},
]

const router = new VueRouter({routes})

const app = new Vue({
  render: h => h(App),
  router,
  components: {App},
}).$mount('#app')

window.app = app
