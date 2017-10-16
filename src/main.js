import Vue from 'vue'
import App from './App.vue'
import router from './router'

/* Import Store */
import store from './store/index.js';

import $ from 'jquery';
require('bootstrap');
require('bootstrap-webpack!./assets/styles/bootstrap/bootstrap.config.js');

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
