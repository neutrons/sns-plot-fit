import Vue from 'vue'
import Router from 'vue-router'
import App from '../App.vue'

const SANS1D = resolve => require(['../components/Plot1D/Main1D.vue'], resolve)
const SANS2D = resolve => require(['../components/Plot2D/Plot2D.vue'], resolve)
const Stitch = resolve => require(['../components/Stitch/Stitch.vue'], resolve)
const TAS = resolve => require(['../components/TAS/TAS.vue'], resolve)
const ORNL404 = resolve => require(['../components/ORNL404.vue'], resolve)

Vue.use(Router)

export default new Router({
  routes: [
    { 
      path: '*', 
      redirect: '/ORNL404',
    },
    {
      path: '/',
      redirect: '/SANS1D'
    },
    {
      path: '/ORNL404',
      name: 'ORNL404',
      component: ORNL404,
      meta: {title: 'ORNL404'}
    },
    {
      path: '/SANS1D',
      name: 'SANS1D',
      component: SANS1D,
      meta: {title: 'SANS1D', group: 'SANS'}
    },
    {
      path: '/SANS2D',
      name: 'SANS2D',
      component: SANS2D,
      meta: {title: 'SANS2D', group: 'SANS'}
    },
    {
      path: '/Stitch',
      name: 'Stitch',
      component: Stitch,
      meta: {title: 'Stitch', group: 'SANS'}
    },
    {
      path: '/TAS',
      name: 'TAS',
      component: TAS,
      meta: {title: 'TAS', group: 'TAS'}
    },
  ],
  linkActiveClass: "active",
})
