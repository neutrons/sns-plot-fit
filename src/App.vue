<template>
  <div class="container-fluid">
      <app-title></app-title>
      <app-main></app-main>
      <app-footer></app-footer>
  </div>
</template>

<script>

import Main from './components/Main.vue';
import Title from './components/Title.vue';
import Footer from './components/Footer.vue';

export default {
  name: 'app',
  components: {
    'app-main': Main,
    'app-title': Title,
    'app-footer': Footer
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style></style>
