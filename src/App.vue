<template>
  <div id="app-container" class="container-fluid">
      
      <div id="error-container"></div>

      <!-- File Drop Zone -->
      <app-dropzone></app-dropzone>
      
      <app-title 
        @switch-plot-component="switchPlotComponent" 
      >
      </app-title>

      <transition name="fade" appear>
        <app-main-1D v-show="toggleView === '1D'"></app-main-1D>
      </transition>  

       <transition name="fade" appear>
        <app-plot-2D v-show="toggleView === '2D'"></app-plot-2D>
      </transition> 

      <transition name="fade" appear>
        <app-stitch v-show="toggleView === 'Stitch'"></app-stitch>
      </transition> 

      <transition name="fade" appear>
        <app-tas v-show="toggleView === 'TAS'"></app-tas>
      </transition> 

      <app-point-modal></app-point-modal>
  </div>
</template>

<script>
import $ from 'jquery';

/* Import Components */
import Main1D from './components/Plot1D/Main1D.vue';
import Plot2D from './components/Plot2D/Plot2D.vue';
import Stitch from './components/Stitch/Stitch.vue';
import TAS from './components/TAS/TAS.vue';
import Title from './components/Title.vue';

import Dropzone from './components/BaseComponents/Dropzone.vue';
import PointModal from './components/BaseComponents/PointModal.vue';

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
    'app-plot-2D': Plot2D,
    'app-tas': TAS,
    'app-dropzone': Dropzone,
    'app-point-modal': PointModal,
  },
  data: function () {
    return {
      toggleView: 'TAS',
      errorCount: 0
    }
  },
  created() {
    // Listen for error messages
    eventBus.$on('error-message', this.generateError);
  },
  methods: {
    switchPlotComponent(plotType) {
      this.toggleView = plotType;
    },
    generateError(errorMSG, type) {
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

<style lang="less">
/* Set Font-Awesome Globally for all sub-components  */
@import '../node_modules/font-awesome/css/font-awesome.min.css';
@import './assets/styles/less/responsiveText.less';
@import './assets/styles/less/mediaQueries.less';
@import './assets/styles/less/app-styles.less';
</style>
