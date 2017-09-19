<template>
<div id="fileuploads1d">

  <div id="file-panel">

    <div id="files-bg">

      <div class="panel panel-primary">
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
              
              <!-- Sort Options  -->
              <div class="panel-body" v-if="this.GETFILES.length > 0">
                <div class="form-inline">
                  <div id="filter-selection" class="input-group">
                    <span id="select-tag" class="input-group-addon">Filter:</span>
                    <select id="group-selection" v-model="gSelect" class="form-control input-sm">
                      <option>All</option>
                      <option v-for="group in groups">{{ group }}</option>
                    </select>
                  </div>
                  
                    <button id="btn-sort" class="btn btn-sm btn-default" v-if="sortOrder === 'Descending'" @click="sortOrder='Ascending'"><span class="glyphicon glyphicon-sort-by-attributes-alt"></span> Date</button>
                    <button id="btn-sort" class="btn btn-sm btn-default" v-if="sortOrder === 'Ascending'" @click="sortOrder='Descending'"><span class="glyphicon glyphicon-sort-by-attributes"></span> Date</button>
                </div>
              </div>
              <div class="panel-body">
                <!-- Get List Table  -->
                <table class="table table-condensed tabletop">
                  <colgroup>
                    <col class="col-md-1">
                    <col class="col-md-1">
                    <col class="col-md-5">
                    <col class="col-md-5">
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Fit</th>
                      <th>Plot</th>
                      <th>File Name</th>
                      <th>Group</th>
                    </tr>
                  </thead>
                </table>
                <div class="getloads-list">
                  <table class="table table-condensed table-hover table-bordered">
                    <colgroup>
                    <col class="col-md-1">
                    <col class="col-md-1">
                    <col class="col-md-5">
                    <col class="col-md-5">
                  </colgroup>
                    <tbody>
                      <tr v-for="file in filteredGroup" :class="isPlotted(file.filename)">
                        <td><input class="oneFit" type="checkbox" :value="file.filename" v-model="fileFitChoice" :disabled=" (isPlotted(file.filename) == 'success' ? false : true)"
                            @change="setFileToFit"></td>
                        <td><input class="checks" type="checkbox" :id="file.filename + '-Get1D'" :value="file.filename" v-model="filesToPlot"></td>
                        <td class="over">{{ file.filename }}</td>
                        <td class="over">{{ file.group }}</td>
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
                      <th class="col-md-2">Fit</th>
                      <th class="col-md-2">Plot</th>
                      <th class="col-md-5">File Name</th>
                      <th class="col-md-3">Delete</th>
                    </tr>
                  </thead>
                </table>
                <div class="uploads-list">
                  <table class="table table-condensed table-hover table-bordered">
                    <tbody>
                      <tr v-for="name in uploadedFilenames" :class="isPlotted(name)">
                        <td><input class="oneFit" type="checkbox" :value="name" v-model="fileFitChoice" :disabled=" (isPlotted(name) == 'success' ? false : true)"
                            @change="setFileToFit"></td>
                        <td><input class="checks" type="checkbox" :id="name + '-Upload1D'" :value="name" v-model="filesToPlot"></td>
                        <td class="over">{{ name }}</td>
                        <td class="over"><button class="btn btn-danger btn-xs" @click="uncheckFile(name) | deleteFile(name)"><span class="glyphicon glyphicon-trash"></span></button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <br>
                <button class="btn btn-danger btn-delete-all" @click="deleteAllUploaded" :disabled="!ISUPLOADED"><span class="glyphicon glyphicon-trash"></span> Delete All</button>
              </div>
            </div>
          </div>
          <div id="btn-selections" v-if="GETFILES.length > 0 || UPLOADEDFILES.length > 0">
            <div class="col-md-6 btn-container"><button class="btn btn-default btn-select-all" @click="checkAll"><span class="glyphicon glyphicon-plus-sign"></span> Select All</button></div>
            <div class="col-md-6 btn-container"><button class="btn btn-default btn-unselect-all" @click="clearSelected" :disabled="!BUTTONDIS"><span class="glyphicon glyphicon-minus-sign"></span> Unselect All</button></div>
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
import axios from 'axios';
import pp from 'papaparse';

export default {
  name: 'fileuploads1d',
  props: ["GETFILES", "BUTTONDIS", "UPLOADEDFILES", "ISUPLOADED"],
  data: function () {
    return {
      filesToPlot: [],
      fileFitChoice: [],
      fileToFit: null,
      storedData: {},
      gSelect: "All",
      sortOrder: "Descending"
    }
  },
  created() {
    // Event Hook from Controls1D
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
        return "success";
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
      for(var i = 0, len = this.UPLOADEDFILES.length; i < len; i++) {
        let match = this.filesToPlot.indexOf(this.UPLOADEDFILES[i].filename);
        if(match > -1) {
          this.filesToPlot.splice(match,1);

          // Remove the file from the stored list
          delete this.storedData[this.UPLOADEDFILES[i].filename];
        }
      }
      eventBus.$emit('remove-uploaded-files');
    },
    checkAll: function() {
      var vm = this;
      for(let i = 0, len = this.GETFILES.length; i < len; i++) {
        let content = this.GETFILES[i].files;
        // console.log("CONTENT", content);
        content.forEach(function(item) {
          if(vm.filesToPlot.indexOf(item.filename) === -1) {
            vm.filesToPlot.push(item.filename);
          }
        });
      }
      
      for(let i = 0, len = this.UPLOADEDFILES.length; i < len; i++) {
        let fname = this.UPLOADEDFILES[i].filename;
        if(this.filesToPlot.indexOf(fname) === -1) {
          this.filesToPlot.push(fname);
        }
      }
    },
    setFileToFit: function() {
      if(this.fileFitChoice.length > 0) this.fileFitChoice = this.fileFitChoice.slice(-1);
      this.fileToFit = this.fileFitChoice[0] ? this.fileFitChoice[0] : null;
    },
    deleteFile: function(filename) {
      // Remove file from stored list
      delete this.storedData[filename];

      // Remove filename from uploads list
      eventBus.$emit('delete-file', filename);
    },
    getURLs: function(files) {

        var tempURLs = [];

        for(let i = 0, len = files.length; i < len; i++) {
          var inGet = document.getElementById(files[i] + "-Get1D");
          var inUpload = document.getElementById(files[i] + "-Upload1D");
          var tempName = files[i];

          if(inGet) {
            for(let i = 0, len=this.GETFILES.length; i < len; i++) {
              for(let j = 0, len=this.GETFILES[i].files.length; j < len; j++) {
                var item = this.GETFILES[i].files[j];

                if(item.filename === tempName) {
                  //console.log("matched filename:", item.filename, tempName);
                  tempURLs.push({type: "get", url: item.url, filename: item.filename});
                  break;
                }
              }
            }
          } else if(inUpload) {

            this.UPLOADEDFILES.forEach(function(item) {
              if(item.filename === tempName) {
                tempURLs.push({type: "upload", url: item.blob, filename: tempName});
              }
            });

          } else {
            console.log("No file to select");
          }
        }

        return tempURLs;
    },
    parse1D: function(data, filename) {
      function beforeFirstChunk1D(chunk) {
        // Split the text into rows
        var rows = chunk.split(/\r\n|\r|\n/);

        var delimiterRegex = /([\s,]+)/g;
        // Find the delimiter on 3rd row
        var match = delimiterRegex.exec(rows[2]);
        var delimiter = match[1];
        var header = rows[0];

        if (header.startsWith("#")) {
          header = header.replace(/#\s*/, '');
          header = header.split(/[\s,]+/).join(delimiter);
        }

        rows[0] = header.toLowerCase();
        // Remove the 2nd row if it's not data
        if (rows[1].length <= 2) {
          rows.splice(1, 1);
        }
        return rows.join("\r\n");
      }

      // files ending in Iq.txt
      var config1D =
          {
            header : true,
            dynamicTyping : true, // parse string to int
            delimiter : "",       // auto-detect
            newline : "",         // auto-detect
            quoteChar : '"',
            skipEmptyLines : true,
            beforeFirstChunk : beforeFirstChunk1D
          }

      var results1D = pp.parse(data, config1D ).data;

      // Filter out any negative values
      results1D = results1D.filter(row => row.y > 0 && row.x > 0);
      results1D.forEach(row => row.name = filename);
      
      return {filename: filename, data: results1D};
    }
  },
  computed: {
    filteredGroup: function() {
      var vm = this;   
      var temp = [];
      var tempGetFiles = _.cloneDeep(this.GETFILES);
      
      if(this.gSelect === 'All') {
        if(this.sortOrder === 'Descending') {
          tempGetFiles.sort(function(a,b){
            return new Date(b.dateModified) - new Date(a.dateModified);
          });
        } else {
          // console.log("Sorting ascending");
          tempGetFiles.sort(function(a,b){
            return new Date(a.dateModified) - new Date(b.dateModified);
          });
        }
        
        // console.log("Temp Get Files", tempGetFiles);
        tempGetFiles.forEach(group => group.files.forEach(file => {
          temp.push({filename: file.filename, group: group.jobTitle});
        }));
      } else {
        // console.log("Filter for: ", this.gSelect);
        let group = tempGetFiles.filter(group => group.jobTitle === vm.gSelect);
        var gName = group[0].jobTitle;

        for(let i = 0, len = group[0].files.length; i < len; i++) {
          temp.push({group: gName, filename: group[0].files[i].filename});
        }
      }
      
      return temp;
    },
    groups: function() {
      var temp = [];
      this.GETFILES.forEach(group => temp.push(group.jobTitle));
      
      return temp.sort();
    },
    uploadedFilenames: function() {
      var fileList = [];

      this.UPLOADEDFILES.forEach(function(item) {
        var name = item.filename;
        fileList.push(name);
      });

      return fileList;
    }
  },
  watch: {
    filesToPlot: {
      // Watch if a file is selected, if so enable buttons and append selected data to a list
      handler: function () {
        var vm = this;

        // If a file is unselected while it has a fit, unselect the fit
        if(this.filesToPlot.indexOf(this.fileToFit) === -1) {
          this.fileToFit = null;
          this.fileFitChoice = [];
        }

        var filesToFetch = [];

        // First check if files to plot are in stored data
        var tempData = this.filesToPlot.map(function(filename) {
          var temp = vm.storedData[filename];
          
          if(temp === undefined) {
            filesToFetch.push(filename);
          } else {
            return vm.parse1D(temp, filename);
          }
        }).filter(item => item !== undefined);
        
        // Next fetch the file URLs
        var fileURLs = this.getURLs(filesToFetch);
        // console.log("File URLs", fileURLs);

        // Next fetch unstored files
        /*****************************************
          When a user selects data to be plotted,
          it first must be fetched, either from
          an HTTP request or FileReader. In order
          to handle pulling multiple files
          asynchronously, JavaScript promises are used.
          That way we can "wait" for all data
          to be loaded asynchronously before moving on
          to plotting the data.
        *****************************************/
        var promises = fileURLs.map(function(url) {
          if(url.type === 'get') {
            return axios.get(url.url).then(function(response) {
              vm.storedData[url.filename] = response.data;
              return {filename: url.filename, data: response.data};
            });        
          } else if(url.type === 'upload') {

            // Turn file reader into a promise in order to
            // wait on the async reading of files with Promise.all below
            return new Promise((resolve, reject) => {
              var reader = new FileReader();

              reader.onload = function (e) {  
                // Get file content
                var content = e.target.result;

                // Code to read Upload 2D file
                vm.storedData[url.filename] = content;
                
                resolve({filename: url.filename, data: content});    
              }
              
              reader.readAsText(url.url, "UTF-8");
            });
          } else {
            //console.log("Sorry, uknown type.");
          }
        });

        if(promises.length === 0) {
          eventBus.$emit('disable-buttons', true);
          eventBus.$emit('set-current-data', tempData, this.filesToPlot);
        } else {
          Promise.all(promises).then(results => {
            // console.log("Results", results);
            // console.log("tempData", tempData);
            var fetchData = results.map(function(result) {
              return vm.parse1D(result.data, result.filename);
            });

            var data = fetchData.concat(tempData);
            
            eventBus.$emit('disable-buttons', true);
            eventBus.$emit('set-current-data', data, this.filesToPlot);
          }).catch(reason => { console.log(reason) });
        }
      },
      deep: true
    },
    fileToFit: function() {
      eventBus.$emit('set-fit-file', this.fileToFit);
    }
  }
}
</script>

<style scoped>
/* File List Table Styles */
.tabletop {
  margin: 0;
  padding: 0;
}

.uploads-list,
.getloads-list {
  height: auto;
  max-height: 225px;
  overflow-y: hidden;
  background-color: white;
}

.uploads-list:hover,
.getloads-list:hover {
  overflow-y: auto;
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

/* File panel styles */

#file-panel-collapse {
      width: 100%;
      padding: 7px 15px;
  }

#file-panel-collapse:hover {
      cursor: pointer;
  }

#file-panel-group {
    background: rgba(0,0,0, 0.02);
    height: 100%;
    padding: 10px 0px;
}

.panel-heading {
    text-align: center;
    padding: 7px 5px;
}

#files-bg {
    margin-bottom: 15px;
}

/* Button Styles */ 
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
  white-space: normal;
}

.btn-container {
  padding: 0px;
}

/* Styles to handle long file/group names  */
td.over
{
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

td.over:hover
{
    overflow: visible; 
    white-space: normal;
    text-overflow: wrap;
    word-wrap: break-word;
    height:auto;
}

.form-control {
  text-align-last: center;
}
</style>