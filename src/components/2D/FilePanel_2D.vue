<template>
  <div id="fileuploads-2d">
    
    <div id="file-panel-2d">

        <div class="files-bg">

            <div class="panel panel-default">
                <div id="file-panel-collapse-2d" class="panel-heading">Files <span class="glyphicon glyphicon-menu-up pull-right"></span></div>
            </div>

            <div id="file-panel-group-2d">

              <!-- Get Files Panel  -->
              <div class="panel-group">
                 <div class="panel panel-success">
                    <div class="panel-heading">
                        <a class="panel-title" data-toggle="collapse" href="#collapse-get-files-2d">Get Files</a>
                    </div>
                    <div id="collapse-get-files-2d" class="panel-collapse collapse in">
                        <div class="panel-body">
                            <table class="table table-condensed tabletop">
                                <thead>
                                    <tr>
                                    <th class="col-md-2" data-toggle="tooltip" title="Select multiple datasets to plot">Plot</th>
                                    <th class="col-md-10">File Name</th>
                                    </tr>
                                </thead>
                                </table>
                                <div class="getloads-list">
                                    <table class="table table-condensed table-hover table-bordered">
                                    <tbody>
                                        <tr v-for="data in this.GETFILES" :class="isPlotted(data.fileName)">
                                        <td><input class="oneFit" type="checkbox" :value="data.fileName" v-model="filePlotChoices" @change="setFileToPlot"></td>
                                        <td>{{ data.fileName }}</td>
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
                        <a class="panel-title" data-toggle="collapse" href="#collapse-uploaded-files-2d">Uploaded Files</a>
                    </div>
                    <div id="collapse-uploaded-files-2d" class="panel-collapse collapse in">
                        <div class="panel-body">
                            <table class="table table-condensed tabletop">
                    <thead>
                        <tr>
                        <th class="col-md-2">Plot</th>
                        <th class="col-md-6">File Name</th>
                        <th class="col-md-4">Delete</th>
                        </tr>
                    </thead>
                    </table>
                    <div class="uploads-list">
                        <table class="table table-condensed table-hover table-bordered">
                        <tbody>
                            <tr v-for="file in this.UPLOADEDFILES" :class="isPlotted(file.fileName)">
                            <td><input class="oneFit" type="checkbox" :value="file.fileName" v-model="filePlotChoices" @change="setFileToPlot"></td>
                            <td>{{ file.fileName }}</td>
                            <td><button class="btn btn-danger btn-xs" @click="uncheckFile(file.fileName) | deleteFile(file.fileName)"><span class="glyphicon glyphicon-trash"></span></button></td>
                            </tr>
                        </tbody>
                    </table>
                    </div>
                    <br>
                        <button class="btn btn-danger btn-delete-all" @click="deleteAllUploaded" :disabled="!ISUPLOADED">Delete All <span class="glyphicon glyphicon-trash"></span></button>
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
import { eventBus } from '../../assets/javascript/eventBus';

export default {
  name: 'fileuploads-2d',
  props: ["GETFILES", "BUTTONDIS", "UPLOADEDFILES", "ISUPLOADED"],
  data: function () {
    return {
      filePlotChoices: [],
      fileToPlot: null
    }
  },
  created() {
    // Receive event emitter from Controls component
    eventBus.$on('reset-file-to-fit', this.resetFileFitChoice);
  },
  methods: {
    resetFileFitChoice: function() {
      this.filePlotChoices = [];
      this.fileToPlot = null;
    },
    clearSelected: function () {
      this.filePlotChoices = [];
      this.fileToPlot = null
    },
    isPlotted: function(filename) {
      // This function dynamically styles the file lists blue for selected data
      if(this.fileToPlot === filename){
        return "info";
      } else {
        return "default";
      }
    },
    uncheckFile: function(filename) {
      if(this.fileToPlot === filename) {
        this.fileToPlot = null;
      }
    },
    deleteAllUploaded: function() {
      for(var i = 0; i < this.UPLOADEDFILES.length; i++) {
        if(this.fileToPlot === this.UPLOADEDFILES[i].fileName) {
          this.fileToPlot = null;
        }
      }
      eventBus.$emit('remove-uploaded-files-2d');
    },
    deleteFile: function(filename) {
      eventBus.$emit('delete-file-2d', filename);
    },
    isPlotted: function(filename) {
      // This function dynamically styles the file lists blue for selected data
      if(this.fileToPlot === filename){
        return "info";
      } else {
        return "default";
      }
    },
    setFileToPlot: function() {
      if(this.filePlotChoices.length > 0) this.filePlotChoices = this.filePlotChoices.slice(-1);
      this.fileToPlot = this.filePlotChoices[0] ? this.filePlotChoices[0] : null;
    }
  },
  watch: {
    fileToPlot: function() {
      // Watch if a file is selected to be fit if so, set it to the fileToFit
      console.log("File to plot changed", this.fileToPlot);
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

td {
  text-align: center;
}

#file-panel-collapse-2d {
      width: 100%;
      padding: 7px 5px;
  }

#file-panel-collapse-2d:hover {
      cursor: pointer;
  }

#file-panel-group-2d {
    background: rgba(0,0,0, 0.02);
    height: 100%;
    padding: 10px 0px;
}

.files-bg {
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