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
                                        <tr v-for="name in getFilenames" :class="isPlotted(name)">
                                        <td><input type="checkbox" :value="name" v-model="filePlotChoices" @change="setFileToPlot"></td>
                                        <td :id="name+'-Get'">{{ name }}</td>
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
                            <tr v-for="name in uploadedFilenames" :class="isPlotted(name)">
                            <td><input class="oneFit" type="checkbox" :value="name" v-model="filePlotChoices" @change="setFileToPlot"></td>
                            <td :id="name +'-Upload'">{{ name }}</td>
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
import pp from 'papaparse';
import axios from 'axios';
import * as _ from 'lodash';

export default {
  name: 'fileuploads-2d',
  props: ["GETFILES", "BUTTONDIS", "UPLOADEDFILES", "ISUPLOADED"],
  data: function () {
    return {
      filePlotChoices: [],
      fileToPlot: null,
      storedData: {}
    }
  },
  methods: {
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
    },
    parse2D: function(data) {
      function beforeFirstChunk2D(chunk) {
          // Split the text into rows
          var rows = chunk.split(/\r\n|\r|\n/);
          var header = rows[0];
          header = header.replace(/,/, '');
          if (header.startsWith("Data columns")) {
            header = header.replace(/Data columns\s*/, '');
            header = header.split(/[\s,-]+/).join("  ");
          }

          // Rename headings for readability
          header = header.replace(/I\(QxQy\)/, 'intensity');
          header = header.replace(/err\(I\)/, 'error');

          rows[0] = header.toLowerCase();
          // Remove the 2nd row if it's not data
          if (rows[1].split(/[\s,-]+/).length <= 2) {
            rows.splice(1, 1);
          }
          return rows.join("\r\n");
        }

        // files endind in Iqxy.dat
        var config2D = {
          header : true,
          dynamicTyping : true, // parse string to int
          delimiter : "  ",
          newline : "", // auto-detect
          quoteChar : '"',
          skipEmptyLines : true,
          beforeFirstChunk : beforeFirstChunk2D
        }

        var results2D = pp.parse(data, config2D );

        return results2D;
    },
    get2DData: function(file) {
        var vm = this;
        var inStored = Object.keys(vm.storedData).indexOf(file.filename) === -1;
        console.log("stored data = ", vm.storedData);

        if(!inStored) {
          // Send the stored data file to be plotted
          console.log("Sending stored data");
          eventBus.$emit('set-2D-data', {data: _.cloneDeep(vm.storedData[file.filename]), filename: file.filename});
        } else {
          console.log("URL = ", file.url);
          // If data is not stored, fetch it, store it, and send data to be plotted
          axios.get(file.url).then(response => {

              let results = vm.parse2D(response.data);
              vm.storedData[file.filename] = results.data;

              // Push to 2D Get Files list
              eventBus.$emit('set-2D-data', {data: results.data, filename: file.filename});
          });
        }
    },
    read2DData: function(file) {
          var vm = this;

          var inStored = Object.keys(vm.storedData).indexOf(file.filename) === -1;
          console.log("stored data = ", vm.storedData);

          if(!inStored) {
            // Send the stored data file to be plotted
            console.log("Sending stored data");
            eventBus.$emit('set-2D-data', {data: _.cloneDeep(vm.storedData[file.filename]), filename: file.filename});
          } else {
            var reader = new FileReader();

            reader.onload = function (e) {  
              // Get file content
              var content = e.target.result;
              // Code to read Upload 2D file
              let results = vm.parse2D(content);
              // console.log("results", results);
              results.data.forEach(el => el.name = file.filename);
              
              // Push to 2D Get Files list
              vm.storedData[file.filename] = results.data;

              // Push to 2D Get Files list
              eventBus.$emit('set-2D-data', {data: results.data, filename: file.filename});
              //eventBus.$emit('add-uploaded-2D', {data: results.data, fileName: fileName });          
            }
            reader.readAsText(file.blob, "UTF-8");
        }
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

      this.UPLOADEDFILES.forEach(item => fileList.push(item.filename));

      return fileList;
    }
  },
  watch: {
    fileToPlot: function() {
      var vm = this;
      // Watch if a file is selected to be fit if so, set it to the fileToFit
      console.log("File to plot changed", this.fileToPlot);
      eventBus.$emit('disable-2D-buttons', true);
      // eventBus.$emit("set-2D-data", this.fileToPlot);

      // console.log("Url list", url1DList);
      //Testing Fetching data
      // Create url list
      var file2D = null;
      
      if(this.fileToPlot === null) {
        eventBus.$emit("set-2D-data", null);
      } else {
        var inGet = document.getElementById(this.fileToPlot + '-Get');
        var inUpload = document.getElementById(this.fileToPlot + '-Upload');

        // If in GET List fetch data
        if(inGet) {
          for(let i = 0, len=this.GETFILES.length; i < len; i++) {
            var found = false;
            for(let j = 0, len=this.GETFILES[i].files.length; j < len; j++) {
              var item = this.GETFILES[i].files[j];
              if(item.filename === this.fileToPlot) {
                file2D = {url: item.url, filename: item.filename};
                found = true;
                break;
              }
            }

            if(found) break;
          }

        this.get2DData(file2D);

        } else if(inUpload) {
          for(let i = 0, len=this.UPLOADEDFILES.length; i < len; i++) {
            var item = this.UPLOADEDFILES[i];
            if(item.filename === this.fileToPlot) {
              file2D = item;
              break;
            }
          }

          console.log("file2D", file2D);
          this.read2DData(file2D);
        } else {
          console.log("No file to select");
        }
      }
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