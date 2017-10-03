<template>
  <div id="app-container" class="container-fluid">
      
      <div id="error-container"></div>

      <!-- File Drop Zone -->
      <div style="visibility:hidden; opacity:0" id="dropzone">
        <div id="textnode">Drop files to add data.</div>
      </div>
      
      <app-title 
        @switch-plot-component="switchPlotComponent" 
        ref="title">
      </app-title>

      <transition name="slide" appear>
        <app-main-1D v-show="toggleView === '1D'"></app-main-1D>
      </transition>  

       <transition name="slide" appear>
        <app-plot-2D v-show="toggleView === '2D'"></app-plot-2D>
      </transition> 

      <transition name="slide" appear>
        <app-stitch v-show="toggleView === 'Stitch'"></app-stitch>
      </transition> 


        <!-- Modal for Point Deletion -->
        <div class="modal fade" id="myModal" role="dialog" data-keyboard="false" data-backdrop="static">
            <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                  <h4 class="modal-title">Deleting Point</h4>
                </div>
                <div class="modal-body">
                  <p>Are you sure you want to remove the point?</p>
                </div>
                <div class="modal-footer">
                  <button id="btn-no-delete" type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                  <button id="btn-yes-delete" type="button" class="btn btn-danger btn-ok">Delete</button>
                </div>
            </div>
            </div>
        </div>
  </div>
</template>

<script>

import $ from 'jquery';

import Main1D from './components/Plot1D/Main1D.vue';
import Plot2D from './components/Plot2D/Plot2D.vue';
import Stitch from './components/Stitch/Stitch.vue';
import Title from './components/Title.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from './assets/javascript/eventBus';

export default {
  name: 'app',
  components: {
    'app-title': Title,
    'app-stitch': Stitch,
    'app-main-1D': Main1D,
    'app-plot-2D': Plot2D
  },
  data: function () {
    return {
      toggleView: '1D',
      errorCount: 0
    }
  },
  mounted() {
      var vm = this;

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
          
          // Call uplaod funciton in child component 'title'
          vm.$refs.title.uploadFile(files);
      });
  },
  created() {
    // Listen for error messages
    eventBus.$on('error-message', this.generateError);
  },
  methods: {
    switchPlotComponent: function(plotType) {
      this.toggleView = plotType;
    },
    generateError: function(errorMSG, type) {
      document.getElementById("error_"+this.errorCount) === null ? this.errorCount = 0 : this.errorCount += 1;
      var newDiv = document.createElement("div");
      var timer = this.errorCount === 0 ? 5000 : 5000+(this.errorCount*1000);
      
      newDiv.innerHTML = '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + errorMSG;
      newDiv.classList.add("error", "alert", ("alert-" + type), "alert-dismissable", "fade", "in")
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

/* Global Styles  */
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

.form-control {
  text-align-last: center;
}

/* Transition effects for Sliding  */

.slide-enter-active {
  transition: all 1.0s ease;
}
.slide-leave-active {
  transition: all 1.0s ease;
}
.slide-enter
/* .slide-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.slide-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

/* Error Message Styles  */
#error-container {
  position: fixed;
  z-index: 9999;
  top: 25px;
  left: 25px;
}

.error {
  position: relative;
}

#myModal {
  display: none;
}
</style>
