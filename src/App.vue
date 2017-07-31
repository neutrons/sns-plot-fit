<template>
  <div id="app-container" class="container-fluid"
   @drop="dropHandler($event)"
        @dragover="dragoverHandler($event)"
        @dragleave="dragleaveHandler($event)">
      <app-title></app-title>
      <app-main></app-main>
  </div>
</template>

<script>

import Main from './components/Main.vue';
import Title from './components/Title.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from './assets/javascript/eventBus';

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
  },
  methods: {
    dropHandler: function(ev) {
      document.getElementById("app-container").style.border = "none";
      document.getElementById("app-container").style.borderRadius = "0";

      console.log("Files dropped...");
      ev.preventDefault();

      var files = ev.dataTransfer.files;
      console.log("Drop files:", files);
      //this.uploadFile(files);
      eventBus.$emit("upload-file", files);
    },
    dragoverHandler: function(ev) {
      document.getElementById("app-container").style.border = "3px dashed green";
      document.getElementById("app-container").style.borderRadius = "5px";

      ev.preventDefault();
    },
    dragleaveHandler: function(ev) {
      // console.log("Drag leave");
      document.getElementById("app-container").style.border = "none";
      document.getElementById("app-container").style.borderRadius = "0";
    }
  }
}
</script>

<style>
#app-container {
  height: 100vh;
}
</style>
