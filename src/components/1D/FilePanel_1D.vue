<template>
<div id="fileuploads1d">

  <div id="file-panel">

    <div id="files-bg">

      <div class="panel panel-default">
        <div id="file-panel-collapse" class="panel-heading">Files <span class="glyphicon glyphicon-menu-up pull-right"></span></div>
      </div>

      <div id="file-panel-group">

        <!-- Get Files Panel  -->
        <div class="panel-group">
          <div class="panel panel-success">
            <div class="panel-heading">
              <a class="panel-title" data-toggle="collapse" href="#collapse-get-files">Get Files</a>
            </div>
            <div id="collapse-get-files" class="panel-collapse collapse in">
              <div class="panel-body">
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
                      <tr v-for="name in getFilenames" :class="isPlotted(name)">
                        <td><input class="oneFit" type="checkbox" :value="name" v-model="fileFitChoice" :disabled=" (isPlotted(name) == 'info' ? false : true)"
                            @change="setFileToFit"></td>
                        <td><input class="checks" type="checkbox" :id="name + '-plot'" :value="name" v-model="filesToPlot"></td>
                        <td>{{ name }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Uploaded Files Panel  -->
          <div class="panel panel-success">
            <div class="panel-heading">
              <a class="panel-title" data-toggle="collapse" href="#collapse-uploaded-files">Uploaded Files</a>
            </div>
            <div id="collapse-uploaded-files" class="panel-collapse collapse in">
              <div class="panel-body">
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
                      <tr v-for="name in uploadedFilenames" :class="isPlotted(name)">
                        <td><input class="oneFit" type="checkbox" :value="name" v-model="fileFitChoice" :disabled=" (isPlotted(name) == 'info' ? false : true)"
                            @change="setFileToFit"></td>
                        <td><input class="checks" type="checkbox" :id="name" :value="name" v-model="filesToPlot"></td>
                        <td>{{ name }}</td>
                        <td><button class="btn btn-danger btn-xs" @click="uncheckFile(name) | deleteFile(name)"><span class="glyphicon glyphicon-trash"></span></button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <br>
                <button class="btn btn-danger btn-delete-all" @click="deleteAllUploaded" :disabled="!ISUPLOADED">Delete All <span class="glyphicon glyphicon-trash"></span></button>
              </div>
            </div>
          </div>
          <div id="btn-selections" v-if="GETFILES.length > 0 || UPLOADEDFILES.length > 0">
            <div class="col-md-6 btn-container"><button class="btn btn-default btn-select-all" @click="checkAll">Select All <span class="glyphicon glyphicon-plus-sign"></span></button></div>
            <div class="col-md-6 btn-container"><button class="btn btn-default btn-unselect-all" @click="clearSelected" :disabled="!BUTTONDIS">Unselect All <span class="glyphicon glyphicon-minus-sign"></span></button></div>
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
import { eventBus } from '../../assets/javascript/eventBus';

export default {
  name: 'fileuploads1d',
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
      // This function dynamically styles the file lists blue for selected data
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
    deleteFile: function(filename) {
      eventBus.$emit('delete-file', filename);
    }
  },
  computed: {
    getFilenames: function() {
      var fileList = [];

      for(let i = 0, len=this.GETFILES.length; i < len; i++) {
        this.GETFILES[i].files.forEach(item => fileList.push(item.filename));
      }

      return fileList;
    },
    uploadedFilenames: function() {
      var fileList = [];

      for(let i = 0, len=this.UPLOADEDFILES.length; i < len; i++) {
        this.UPLOADEDFILES[i].files.forEach(item => fileList.push(item.filename));
      }

      return fileList;
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
.tabletop {
  margin: 0;
  padding: 0;
}

.uploads-list,
.getloads-list {
  height: auto;
  max-height: 225px;
  overflow-y: scroll;
  background-color: whitesmoke;
}

li {
  list-style: none;
}

th {
  text-align: center;
}

td {
  text-align: center;
}

#file-panel-collapse {
      width: 100%;
  }

#file-panel-collapse:hover {
      cursor: pointer;
  }

#file-panel-group {
    background: rgba(0,0,0, 0.02);
    height: 100%;
    padding: 10px 0px;
}

#files-bg {
    margin-bottom: 15px;
}

.btn-upload, .btn-fetch {
  width: 100%;
  margin-bottom: 10px;
}

.btn-delete-all {
  width: 100%;
  padding: 2px;
}

.btn-select-all, .btn-unselect-all {
  width: 100%;
  padding: 2px;
  margin: 5px 0px;
}

.btn-container {
  padding: 0px;
}
</style>