<template>
  <div id="app-container" class="container-fluid">
      <div id="error-container"></div>
      <!-- File Drop Zone -->
      <div style="visibility:hidden; opacity:0" id="dropzone">
        <div id="textnode">Drop files to add data.</div>
      </div>
      
      <app-title></app-title>

      <transition name="fade" mode="out-in" appear>
        <main1D v-show="!togglePlot"></main1D>
      </transition>

      <transition name="fade" mode="out-in">
        <main2D v-show="togglePlot"></main2D>
      </transition>
  </div>
</template>

<script>

import $ from 'jquery';
import main1D from './components/1D/Main_1D.vue';
import main2D from './components/2D/Main_2D.vue';
import Title from './components/Title.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from './assets/javascript/eventBus';

export default {
  name: 'app',
  components: {
    main1D,
    main2D,
    'app-title': Title
  },
  data: function () {
    return {
      togglePlot: false,
      errorCount: 0
    }
  },
  mounted() {

      // Listen for events from Title
      eventBus.$on('switch-plot-component', this.switchPlotComponent);

      // Event listeners are added for monitoring drag 'n drop of data files.
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
        eventBus.$emit("upload-files", files);
      });
  },
  created() {
    // Listen for error messages
    eventBus.$on('error-message', this.generateError);
  },
  methods: {
    switchPlotComponent: function(plotType) {
      if(plotType === '1D') {
        this.togglePlot = false;
      } else {
        this.togglePlot = true;
      }
    },
    generateError: function(errorMSG) {
      var self = this;
      document.getElementById("error_"+this.errorCount) === null ? this.errorCount = 0 : this.errorCount += 1;
      var newDiv = document.createElement("div");
      var timer = this.errorCount === 0 ? 5000 : 5000+(this.errorCount*1000);
      
      console.log("Timer:", timer);
      console.log("Error count:", this.errorCount);
      
      newDiv.innerHTML = '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + errorMSG;
      newDiv.classList.add("error", "alert", "alert-danger", "alert-dismissable", "fade", "in")
      var tempID = "error_" + this.errorCount;
      newDiv.id = tempID;
      
      // add the newly created element and its content into the DOM 
      document.getElementById("error-container").append(newDiv);
      setTimeout(function() {
          $("#"+tempID).fadeTo(500, 0).slideUp(500, function(){
          $(this).remove(); 
        });
      }, timer);
    }
  }
}
</script>

<style>
html,
body {
   margin:0;
   padding:0;
}

body {
    background: white;
}
.container-fluid {
    padding-left: 0px;
    padding-right: 0px;
}

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

/* Transition Effects for 1D and 2D plot components  */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}

#main1D, #main2D {
  position: absolute;
  right: 0;
  left: 0;
}

/* Error Message Styles  */
#error-container {
  position: absolute;
  z-index: 9999;
  top: 25px;
  left: 25px;
}

.error {
  position: relative;
}
</style>
