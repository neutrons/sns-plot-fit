<template>
  <div id="app-container" class="container-fluid">

      <!-- File Drop Zone -->
      <div style="visibility:hidden; opacity:0" id="dropzone">
        <div id="textnode">Drop files to add data.</div>
      </div>
      
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
  mounted() {

      window.addEventListener("dragenter", function (e) {
              document.querySelector("#dropzone").style.visibility = "";
              document.querySelector("#dropzone").style.opacity = 1;
              document.querySelector("#textnode").style.fontSize = "48px";
      });

      window.addEventListener("dragleave", function (e) {
          e.preventDefault();

              document.querySelector("#dropzone").style.visibility = "hidden";
              document.querySelector("#dropzone").style.opacity = 0;
              document.querySelector("#textnode").style.fontSize = "42px";
          
      });

      window.addEventListener("dragover", function (e) {
          e.preventDefault();
          document.querySelector("#dropzone").style.visibility = "";
          document.querySelector("#dropzone").style.opacity = 1;
          document.querySelector("#textnode").style.fontSize = "48px";
      });

      window.addEventListener("drop", function (e) {
          e.preventDefault();
          document.querySelector("#dropzone").style.visibility = "hidden";
          document.querySelector("#dropzone").style.opacity = 0;
          document.querySelector("#textnode").style.fontSize = "42px";
          
        var files = e.dataTransfer.files;
          console.log("Drop files:", files);
          //this.uploadFile(files);
          eventBus.$emit("upload-file", files);
        });
  }
}
</script>

<style>
#app-container {
  height: 100vh;
}
div#dropzone {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999999999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    transition: visibility 175ms, opacity 175ms;
    display: table;
    text-shadow: 1px 1px 2px #000;
    color: #fff;
    background: rgba(0, 0, 0, 0.45);
    font: bold 42px Oswald, DejaVu Sans, Tahoma, sans-serif;
}
div#textnode {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
    transition: font-size 175ms;
}
</style>
