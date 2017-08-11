<template>
  <div id="main2D" class="col-md-12">
    <div class="container-fluid">

      <div id="left-sidebar-2d" class="col-md-2">

          <!--Pass variables to fileload component-->
            <files-2d
            :BUTTONDIS="buttonDis"
            :ISUPLOADED="isUploaded"
            :GETFILES="getFiles"
            :UPLOADEDFILES="uploadedFiles"></files-2d>

        <!--Pass variables to controls component-->
            <controls-2d
            :BUTTONDIS="buttonDis"></controls-2d>

      </div>
          
      <plot-2d
      :BUTTONDIS="buttonDis"></plot-2d>

    </div>
  </div>
</template>

<script>
import * as _ from 'lodash';
import $ from 'jquery';

import Controls_2D from './ControlsPanel_2D.vue';
import Files_2D from './FilePanel_2D.vue';
import Plot_2D from './Plot_2D.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

export default {
    name: 'main1D',
    components: {
      'controls-2d': Controls_2D,
      'files-2d': Files_2D,
      'plot-2d': Plot_2D
    },
    data: function () {
      return {
        buttonDis: false,
        getFiles: [],
        uploadedFiles: [],
        isUploaded: false
      }
    },
    created() {

    },
    mounted() {
    // Code for Collapsible panels
      $('#plot-panel-collapse-2d').click(function(e) {
          $('#plot-panel-collapse-2d').find('span').toggleClass('glyphicon-menu-up glyphicon-menu-down');
          $("#plot-collapse-2d").slideToggle(300);
      });

      $('#control-panel-collapse-2d').click(function(e) {
          $('#control-panel-collapse-2d').find('span').toggleClass('glyphicon-menu-up glyphicon-menu-down');
          $("#control-panel-group-2d").slideToggle(300);
      });

      $('#file-panel-collapse-2d').click(function(e) {
          $('#file-panel-collapse-2d').find('span').toggleClass('glyphicon-menu-up glyphicon-menu-down');
          $("#file-panel-group-2d").slideToggle(300);
      });
    },
    methods: {},
    watch: {}
  }
</script>

<style scoped>
@import '../../assets/styles/main-component-styles.css';
</style>
