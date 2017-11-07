import Vue from 'vue'
import Router from 'vue-router'
import App from '../App.vue'

import SANS1D from '../components/Plot1D/Main1D.vue';
import SANS2D from '../components/Plot2D/Plot2D.vue';
import Stitch from '../components/Stitch/Stitch.vue';
import TAS from '../components/TAS/TAS.vue';

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', 
      redirect: '/TAS' 
    },
    {
      path: '/SANS1D',
      name: 'SANS1D',
      component: SANS1D
    },
    {
      path: '/SANS2D',
      name: 'SANS2D',
      component: SANS2D
    },
    {
      path: '/Stitch',
      name: 'Stitch',
      component: Stitch
    },
    {
      path: '/TAS',
      name: 'TAS',
      component: TAS
    }
  ],
  linkActiveClass: "active",
})
