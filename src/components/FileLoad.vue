<template>
  <div class="fileuploads">
    <div class="row">
      <div>
        <h3>GET File(s): <button class="btn btn-xs btn-primary" @click="fetchData"><span class="glyphicon glyphicon-download"></span></button></h3>
      </div>
      <table class="table table-condensed tabletop">
      <thead>
        <tr>
          <th class="col-sm-1" data-toggle="tooltip" title="You can only select one dataset to fit a line to.">Fit</th>
          <th class="col-sm-2" data-toggle="tooltip" title="Select multiple datasets to plot">Plot</th>
          <th class="col-sm-9">File Name</th>
        </tr>
      </thead>
      </table>
      <div class="getloads-list">
        <table class="table table-condensed table-hover table-bordered">
          <tbody>
            <tr v-for="data in this.GETFILES" :class="isPlotted(data.fileName)">
              <td><input class="oneFit" type="checkbox" :value="data.fileName" v-model="fileFitChoice" :disabled=" (isPlotted(data.fileName) == 'info' ? false : true)" @change="setFileToFit"></td>
              <td><input class="checks" type="checkbox" :id="data.fileName + '-plot'" :value="data.fileName" v-model="filesToPlot"></td>
              <td>{{ data.fileName }}</td>
            </tr>
          </tbody>
      </table>
      </div>
    </div>
    <div class="row">
      <h3>Uploaded File(s):</h3>
      <table class="table table-condensed tabletop">
      <thead>
        <tr>
          <th class="col-sm-1">Fit</th>
          <th class="col-sm-1">Plot</th>
          <th class="col-sm-6">File Name</th>
          <th class="col-sm-4">Delete</th>
        </tr>
      </thead>
      </table>
      <div class="uploads-list">
        <table class="table table-condensed table-hover table-bordered">
          <tbody>
            <tr v-for="file in this.UPLOADEDFILES" :class="isPlotted(file.fileName)">
              <td><input class="oneFit" type="checkbox" :value="file.fileName" v-model="fileFitChoice" :disabled=" (isPlotted(file.fileName) == 'info' ? false : true)" @change="setFileToFit"></td>
              <td><input class="checks" type="checkbox" :id="file.fileName" :value="file.fileName" v-model="filesToPlot"></td>
              <td>{{ file.fileName }}</td>
              <td><button class="btn btn-danger btn-xs" @click="uncheckFile(file.fileName) | deleteFile(file.fileName)"><span class="glyphicon glyphicon-trash"></span></button></td>
            </tr>
          </tbody>
      </table>
      </div>
      <br>
      <div>
          <button class="btn btn-primary btn-xs btn-files" @click="checkAll">Select all <span class="glyphicon glyphicon-plus-sign"></span></button>
          <button class="btn btn-danger btn-xs btn-files" @click="clearSelected" :disabled="!BUTTONDIS">Unselect All <span class="glyphicon glyphicon-minus-sign"></span></button>
          <button class="btn btn-danger btn-xs btn-files" @click="deleteAllUploaded" :disabled="!ISUPLOADED">Delete Files <span class="glyphicon glyphicon-trash"></span></button>
      </div>
      <br>
      <div class="dropzone-area" drag-over="handleDragOver">
        <div class="dropzone-text">
          <span class="dropzone-title">Drop file(s) here or click to select</span>
        </div>
        <input type="file" id="input" multiple @change="uploadFile">
      </div>
    </div>
  </div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If files are uploaded in 'fileUpload.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../assets/javascript/eventBus';

export default {
  props: ["GETFILES", "BUTTONDIS", "UPLOADEDFILES", "ISUPLOADED"],
  data: function () {
    return {
      filesToPlot: [],
      fileFitChoice: [],
      fileToFit: null
    }
  },
  methods: {
    clearSelected: function () {
      this.fileFitChoice = [];
      this.filesToPlot = [];
      this.fileToFit = null;
    },
    isPlotted: function(filename) {
      // This function dynamically styles the file lists blue for selected, default 
      if(this.filesToPlot.indexOf(filename) > -1){
        return "info";
      } else {
        return "default";
      }
    },
    uncheckFile: function(filename) {
      if(this.filesToPlot.indexOf(filename) > -1) {
        this.filesToPlot.splice(this.filesToPlot.indexOf(filename),1);
      }
    },
    deleteAllUploaded: function() {
      for(var i = 0; i < this.UPLOADEDFILES.length; i++) {
        if(this.filesToPlot.indexOf(this.UPLOADEDFILES[i].fileName) > -1) {
          this.filesToPlot.splice(this.filesToPlot.indexOf(this.UPLOADEDFILES[i].fileName),1);
        }
      }
      eventBus.$emit('remove-uploaded-files');
    },
    checkAll: function() {
      for(let i = 0; i < this.GETFILES.length; i++) {
        if(this.filesToPlot.indexOf(this.GETFILES[i].fileName) === -1) {
          this.filesToPlot.push(this.GETFILES[i].fileName);
        }
      }
      for(let i = 0; i < this.UPLOADEDFILES.length; i++) {
        if(this.filesToPlot.indexOf(this.UPLOADEDFILES[i].fileName) === -1) {
          this.filesToPlot.push(this.UPLOADEDFILES[i].fileName);
        }
      }
    },
    setFileToFit: function() {
      if(this.fileFitChoice.length > 0) this.fileFitChoice = this.fileFitChoice.slice(-1);
      this.fileToFit = this.fileFitChoice[0] ? this.fileFitChoice[0] : null;
    },
    uploadFile: function() {
      eventBus.$emit('upload-file');
    },
    fetchData: function() {
      eventBus.$emit('fetch-data');
    },
    deleteFile: function(filename) {
      eventBus.$emit('delete-file', filename);
    }
  },
  watch: {
    filesToPlot: {
      // Watch if a file is selected, if so enable buttons and append selected data to a list
      handler: function () {
        
        // If a file is unselected while it has a fit, unselect the fit
        if(this.filesToPlot.indexOf(this.fileToFit) === -1) {
          this.fileToFit = null;
          this.fileFitChoice = [];
        }

        eventBus.$emit('disable-buttons', true);
        eventBus.$emit('set-current-data', this.filesToPlot);
      },
      deep: true
    },
    fileToFit: function() {
      // Watch if a file is selected to be fit if so, set it to the fileToFit
      eventBus.$emit('set-fit-file', this.fileToFit);
    }
  }
}
</script>

<style scoped>
.fileuploads {
  text-align: center;
  min-height: 90vh;
  margin-bottom: 0px;
  padding: 25px;
  background-color: gainsboro;
  border-left: 1px solid rgba(0,0,0,0.25);
}

.btn-files {
  font-size: 11px;
}
.tabletop {
  margin: 0;
  padding: 0;
}

.uploads-list,
.getloads-list {
  height: 125px;
  overflow-y: scroll;
  background-color: whitesmoke;
}

li {
  list-style: none;
}

.dropzone-area {
  width: auto;
  height: 175px;
  position: relative;
  border: 1.5px dashed white;
  border-radius: 10px;
}

.dropzone-area:hover {
  border: 1.5px dashed black;
  color: black;
  background-color: white;
  border-radius: 10px;
}

.dropzone-area:hover .dropzone-title {
  color: gray;
}

.dropzone-area input {
  position: absolute;
  cursor: pointer;
  top: 0px;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.dropzone-text {
  position: absolute;
  top: 50%;
  text-align: center;
  transform: translate(0, -50%);
  width: 100%;
}

.dropzone-text span {
  display: block;
  font-family: Arial, Helvetica;
  line-height: 1.9;
}

.dropzone-title {
  font-size: 13px;
  color: black;
  letter-spacing: 0.4px;
}

.dropzone-button {
  position: absolute;
  top: 10px;
  right: 10px;
  display: none;
}

th {
  text-align: center;
}

</style>