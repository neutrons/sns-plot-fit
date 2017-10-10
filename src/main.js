import Vue from 'vue'
import App from './App.vue'
import router from './router'

/* Import Store */
import store from './store/index.js';

import $ from 'jquery';
require('bootstrap');

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
