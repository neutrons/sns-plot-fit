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
    name: 'main2D',
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
      // Event hooks for 'Title.vue'
      eventBus.$on('add-get-2D', this.addGetData);
      eventBus.$on('add-uploaded-2D', this.addUploadedData);
      eventBus.$on('check-duplicate', this.checkDuplicateFile);

      // Event hooks for 'FileLoad.vue'
      eventBus.$on('remove-uploaded-files-2d', this.removeUploadedFiles);
      eventBus.$on('delete-file-2d', this.deleteFile);
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
    methods: {
      addGetData: function(data) {
        this.getFiles.push(data);
      },
      addUploadedData: function(data) {
        // Add data to uploaded files list
        console.log("Adding data...", data);
        this.uploadedFiles.unshift(data);
      },
      checkDuplicateFile: function (filename) {

        if (this.uploadedFiles.find(el => el.fileName === filename)) {
          alert("Duplicate file: " + filename);
          return true;
        } else if (this.getFiles.find(el => el.fileName === filename)) {
          alert("Duplicate file: " + filename);
        } else {
          return false;
        }

      },
      disableButtons: function (bool) {
        this.buttonDis = bool;
      },
      setCurrentData: function (checkedfiles) {
      },
      deleteFile: function (filename) {
        // Function to delete file from the uploaded list
        for (var i = 0; i < this.uploadedFiles.length; i++) {
          if (this.uploadedFiles[i].fileName === filename) {
            // Splice will remove the object from array index i    
            this.uploadedFiles.splice(i, 1);
          }
        }
      },
      removeUploadedFiles: function () {
        this.uploadedFiles = [];
      }

    },
    watch: {
      uploadedFiles: function () {
        // Watch if a file has been uploaded, if so enable delete file buttons
        if (this.uploadedFiles.length > 0) {
          this.isUploaded = true;
        } else {
          this.isUploaded = false;
        }
      }
    }
  }
</script>

<style scoped>
@import '../../assets/styles/main-component-styles.css';
</style>
