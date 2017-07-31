<template>
  <div id="fileuploads">
    
    <div id="file-panel">

        <div id="files-bg">

            <div class="panel panel-warning">
                <div id="file-panel-collapse" class="panel-heading">Files <span class="glyphicon glyphicon-menu-up pull-right"></span></div>
            </div>

            <div id="file-panel-group">

              <div class="panel-group" id="accordion-file">
                <div class="panel panel-success">
                    <div class="panel-heading">
                        <a class="panel-title" data-toggle="collapse" data-parent="#accordion-file" href="#collapse-get-files">Get Files</a>
                    </div>
                    <div id="collapse-get-files" class="panel-collapse collapse in">
                        <div class="panel-body">
                        <button class="btn btn-primary btn-sm btn-fetch" @click="fetchData">Fetch Files&hellip; <span class="glyphicon glyphicon-download"></span></button>
                            <table class="table table-condensed tabletop">
                                <thead>
                                    <tr>
                                    <th class="col-md-1" data-toggle="tooltip" title="You can only select one dataset to fit a line to.">Fit</th>
                                    <th class="col-md-2" data-toggle="tooltip" title="Select multiple datasets to plot">Plot</th>
                                    <th class="col-md-9">File Name</th>
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
                  </div>
                </div>

                <div class="panel panel-success">
                    <div class="panel-heading">
                        <a class="panel-title" data-toggle="collapse" data-parent="#accordion-file" href="#collapse-uploaded-files">Uploaded Files</a>
                    </div>
                    <div id="collapse-uploaded-files" class="panel-collapse collapse in">
                        <div class="panel-body">
                          
                        <label class="btn btn-primary btn-sm btn-upload">Select Files&hellip; <span class="glyphicon glyphicon-file"></span> <input id="file-upload" type="file" style="display: none;" @change="uploadFile" multiple></label>
                            <table class="table table-condensed tabletop">
                    <thead>
                        <tr>
                        <th class="col-md-1">Fit</th>
                        <th class="col-md-1">Plot</th>
                        <th class="col-md-6">File Name</th>
                        <th class="col-md-4">Delete</th>
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
                    
                        <button class="btn btn-primary btn-xs btn-files" @click="checkAll">Select all <span class="glyphicon glyphicon-plus-sign"></span></button>
                        <button class="btn btn-danger btn-xs btn-files" @click="clearSelected" :disabled="!BUTTONDIS">Unselect All <span class="glyphicon glyphicon-minus-sign"></span></button>
                        <button class="btn btn-danger btn-xs btn-files" @click="deleteAllUploaded" :disabled="!ISUPLOADED">Delete All <span class="glyphicon glyphicon-trash"></span></button>
                    
                        </div>
                    </div>
                </div>

            </div>
            </div>
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
  name: 'fileuploads',
  props: ["GETFILES", "BUTTONDIS", "UPLOADEDFILES", "ISUPLOADED"],
  data: function () {
    return {
      filesToPlot: [],
      fileFitChoice: [],
      fileToFit: null
    }
  },
  created() {
    // Receive event emitter from Controls component
    eventBus.$on('reset-file-to-fit', this.resetFileFitChoice);
  },
  methods: {
    resetFileFitChoice: function() {
      this.fileFitChoice = [];
      this.fileToFit = null;
    },
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
      let files = document.getElementById("file-upload").files;
      console.log("Files:", files);
      eventBus.$emit('upload-file', files);
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
.btn-files {
  font-size: 11px;
}
.tabletop {
  margin: 0;
  padding: 0;
}

.uploads-list,
.getloads-list {
  height: auto;
  max-height: 325px;
  overflow-y: scroll;
  background-color: whitesmoke;
}

li {
  list-style: none;
}

th {
  text-align: center;
}

#file-panel-collapse {
      width: 100%;
  }

#file-panel-collapse:hover {
      cursor: pointer;
  }

#file-panel-group {
    padding: 10px;
}

#files-bg {
    background: rgba(0,0,0, 0.02);
}

.btn-upload, .btn-fetch {
  width: 100%;
  margin-bottom: 10px;
}
</style>