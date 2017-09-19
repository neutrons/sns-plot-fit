<template>
  <div class="main col-md-12">
    <div class="container-fluid">
      <slot>
      </slot>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import * as _ from 'lodash';
import $ from 'jquery';

/* Import Control Elements */
import Controls from './Controls/Controls.vue';

/* Import File Elements */
import Files from './Files/Files.vue';

/* Import Plot Elements */
import Plot from './Plot/Plot.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

export default {
    name: 'main',
    components: {
        'app-files': Files,
        'app-controls': Controls,
        'app-plot': Plot
    },
    data: function () {
      return {
        getFiles: [],
        uploadedFiles: [],
        selectedData: [],
        isUploaded: false,
        buttonDis: false,
        plotParams: {}
      }
    },
    methods: {
      addGetData: function(data) {
        this.getFiles = _.cloneDeep(data);

        // Add filename to color domain
        data.forEach(group => group.files.forEach(file => {
          if(this.colorDomain.indexOf(file.filename) === -1) {
            this.colorDomain.push(file.filename);
            }
          }));
      },
      addUploadedData: function(data) {
        this.uploadedFiles = this.uploadedFiles.concat(_.cloneDeep(data));

        data.forEach(file => {
          if (this.colorDomain.indexOf(file.filename) === -1) {
            this.colorDomain.push(file.filename);
          }
        });
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
      deleteFile: function (filename) {
        for (var i = 0; i < this.uploadedFiles.length; i++) {
          if (this.uploadedFiles[i].filename === filename) {
            // Splice will remove the object from array index i    
            this.uploadedFiles.splice(i, 1);
          }
        }
      },
      removeUploadedFiles: function () {
        var vm = this;
        // Remove all uploaded file names from the color domain list
        this.colorDomain = this.colorDomain.filter(function(name) {
          let match = vm.uploadedFiles.find(file => file.filename === name);
          if(match === undefined) {
            return true;
          } else {
            return false;
          }
        });

        this.uploadedFiles = [];
      }
    }
  }
</script>

<style scoped>

</style>
