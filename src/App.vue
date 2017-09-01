<template>
  <div id="app-container" class="container-fluid">
      
      <div id="error-container"></div>

      <!-- File Drop Zone -->
      <div style="visibility:hidden; opacity:0" id="dropzone">
        <div id="textnode">Drop files to add data.</div>
      </div>
      
      <app-title></app-title>

      <!-- <transition name="slide" mode="out-in">
        <app-1d v-show="toggleView === '1D'"></app-1d>
      </transition>

      <transition name="slide" mode="out-in">
        <app-2d v-show="toggleView === '2D'"></app-2d>
      </transition>   -->

       <!-- <transition name="slide" mode="out-in">
        <app-new-1D v-show="toggleView === '1D'"></app-new-1D>
      </transition>  -->

      <transition name="slide" mode="out-in">
        <app-stitch v-show="toggleView === 'Stitch'"></app-stitch>
      </transition> 
  </div>
</template>

<script>

import $ from 'jquery';

import main1D from './components/1D/Main_1D.vue';
import main2D from './components/2D/Main_2D.vue';
import New1D from './components/New1D.vue';
import Stitch from './components/Stitch/Stitch.vue';
import Title from './components/Title.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from './assets/javascript/eventBus';

export default {
  name: 'app',
  components: {
    'app-1d': main1D,
    'app-2d': main2D,
    'app-stitch': Stitch,
    'app-title': Title,
    'app-new-1D': New1D
  },
  data: function () {
    return {
      toggleView: 'Stitch',
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
        // console.log("Drop files:", files);
        eventBus.$emit("upload-files", files);
      });
  },
  created() {
    // Listen for error messages
    eventBus.$on('error-message', this.generateError);
  },
  methods: {
    switchPlotComponent: function(plotType) {
      console.log("Changing plot type: ", plotType);
      this.toggleView = plotType;
    },
    generateError: function(errorMSG) {
      document.getElementById("error_"+this.errorCount) === null ? this.errorCount = 0 : this.errorCount += 1;
      var newDiv = document.createElement("div");
      var timer = this.errorCount === 0 ? 5000 : 5000+(this.errorCount*1000);
      
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
/* Set Font-Awesome Globally for all sub-components  */
 @import '../node_modules/font-awesome/css/font-awesome.min.css'; 

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

/* Transition effects for Sliding  */
.slide-enter-active,
.slide-leave-active {
  transition: all 1.25s ease;
}

.slide-enter-to, .slide-leave-to {
  transform: translateX(100vw);
}

/* #main1D.slide-enter {
  transform: translateX(100vw);
}
#main1D.slide-leave-active {
  transform: translateX(100vw);
}

#main2D.slide-enter {
  transform: translateX(-100vw);
}
#main2D.slide-leave-active {
  transform: translateX(-100vw);
} */

/* #main1D, #main2D, #Stitch, #New1D {
  position: absolute;
  right: 0;
  left: 0;
} */

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
