<template>
  <div class="container-fluid">
      <app-title></app-title>
      <app-main></app-main>
  </div>
</template>

<script>

import Main from './components/Main.vue';
import Title from './components/Title.vue';

export default {
  name: 'app',
  components: {
    'app-main': Main,
    'app-title': Title
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style>
</style>
