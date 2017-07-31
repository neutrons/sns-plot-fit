<template>
  <div id="main">
    <div class="container-fluid">

    <div id="left-sidebar" class="col-md-2">

        <!--Pass variables to fileload component-->
          <app-file-load
          :BUTTONDIS="buttonDis"
          :GETFILES="getFiles"
          :UPLOADEDFILES="uploadedFiles"
          :ISUPLOADED="isUploaded"
          ></app-file-load>

      <!--Pass variables to controls component-->
          <app-controls
          :BUTTONDIS="buttonDis"
          :FILETOFIT="fileToFit"
          :EQUATION="$data.currentConfiguration.equation"
          :XTRANS="$data.currentConfiguration.xTransformation"
          :YTRANS="$data.currentConfiguration.yTransformation"
          ></app-controls>

    </div>
        
      <div id="plot-panel" class="col-md-10">
          <div class="panel-group">

            <div class="panel panel-default">
              <div class="panel-heading">
                <button id="btn-reset-plot" class="btn btn-default btn-sm pull-left" @click="resetPlot" v-if="buttonDis" :disabled="!buttonDis">Reset Plot</button>
                <div id="plot-panel-collapse">Plot <span class="glyphicon glyphicon-menu-up pull-right"></span></div>
              </div>
            </div>

            <div id="plot-collapse" class="panel-body">
              <div id="plot-area"></div>
              
              <!-- Fit Results Table to add fit results -->
              <div id="fit-results-table" class="table-responsive" v-show="fileToFit && currentConfiguration.fit !== 'None'">          
                <table class="table table-bordered">
                  <caption><h4>Fit Results:</h4></caption>
                
                  <tbody>
                  <tr>
                    <td id="fit-file"></td>
                    <td id="fit-type"></td>
                    <td id="fit-points"></td>
                    <td id="fit-range"></td>
                    <td id="fit-error"></td>
                  </tr>
                
                    <tr>
                      <td colspan="3" class="sub-heading">Fit Configuration:</td>
                      <td colspan="2" class="sub-heading">Coefficients:</td>	
                    </tr>
                    <tr>
                      <td colspan="3" id="fit-configs">
                      <ul>
                            <li id="fit-damping"></li>
                            <li id="fit-iterations"></li>
                            <li id="fit-tolerance"></li>
                            <li id="fit-gradient"></li>
                        </ul>
                      </td>
                      <td colspan="2" id="fit-coefficients">
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
        </div>
    </div>
      </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import * as axios from 'axios'; // Axios package to handle HTTP requests
import * as _ from 'lodash';
import $ from 'jquery';
import plotCurrentData from '../assets/javascript/plotCurrentData';
import Controls from './Controls.vue';
import FileLoad from './FileLoad.vue';

import fd from '../assets/javascript/fitData.js';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../assets/javascript/eventBus';

export default {
  name: 'main',
  mixins: [plotCurrentData],
    components: {
      'app-controls': Controls,
      'app-file-load': FileLoad
    },
    created() {
      // Event hooks for 'Controls.vue'
      eventBus.$on('set-equation', this.setEquation);
      eventBus.$on('set-scales', this.setScales);
      eventBus.$on('set-fit', this.setFit);
      eventBus.$on('set-fit-settings', this.setFitSettings);
      eventBus.$on('set-transformations', this.setTransformations);
      eventBus.$on('reset-transformation', this.resetTransformation);

      // Event hooks for 'FileLoad.vue'
      eventBus.$on('fetch-data', this.fetchData);
      eventBus.$on('upload-file', this.uploadFile);
      eventBus.$on('set-current-data', this.setCurrentData);
      eventBus.$on('set-fit-file', this.setFitFile);
      eventBus.$on('remove-uploaded-files', this.removeUploadedFiles);
      eventBus.$on('delete-file', this.deleteFile);
      eventBus.$on('disable-buttons', this.disableButtons);
    },
    mounted() {
    // Code for Collapsible panels
      $('#plot-panel-collapse').click(function(e) {
          $('#plot-panel-collapse').find('span').toggleClass('glyphicon-menu-up glyphicon-menu-down');
          $("#plot-collapse").slideToggle(300);
      });

      $('#control-panel-collapse').click(function(e) {
          $('#control-panel-collapse').find('span').toggleClass('glyphicon-menu-down glyphicon-menu-up');
          $("#control-panel-group").slideToggle(300);
      });

      $('#file-panel-collapse').click(function(e) {
          $('#file-panel-collapse').find('span').toggleClass('glyphicon-menu-up glyphicon-menu-down');
          $("#file-panel-group").slideToggle(300);
      });
    },
    data: function () {
      return {
        getFiles: [],
        uploadedFiles: [],
        colorDomain: [],
        selectedData: [],
        scales: {
          xScale: d3.scaleLinear(),
          yScale: d3.scaleLinear()
        },
        fileToFit: null,
        isUploaded: false,
        isCollapseRight: false,
        isCollapseLeft: false,
        buttonDis: false,
        plotParams: {},
        currentConfiguration: {
            fit: 'Linear',
            equation: 'm*x+b',
            yTransformation: 'y',
            xTransformation: 'x',
            eTransformation: "e",
            yLabel: "I",
            xLabel: "Q"
        },
        fitConfigurations: {
          'None': {
            fit: 'None',
            equation: null,
            yTransformation: null,
            xTransformation: null,
            eTransformation: null,
            yLabel: "I",
            xLabel: "Q"
          },
          'Linear': {
            fit: 'Linear',
            equation: 'm*x+b',
            yTransformation: 'y',
            xTransformation: 'x',
            eTransformation: "e",
            yLabel: "I",
            xLabel: "Q"
          },
          'Guinier': {
            fit: 'Guinier',
            equation: "-Rg^2/3*x+b",
            yTransformation: "log(y)",
            xTransformation: "log(x)",
            eTransformation: "((1/x)*e)^2",
            yLabel: "Log(I)",
            xLabel: "Log(Q)"
          },
          'Porod': {
            fit: 'Porod',
            equation: "A-n*x",
            yTransformation: "log(y)",
            xTransformation: "log(x)",
            eTransformation: "((1/x)*e)^2",
            yLabel: "Log(I)",
            xLabel: "Log(Q)"
          },
          'Zimm': {
            fit: 'Zimm',
            equation: "1/I0+Cl^2/I0*x",
            yTransformation: "1/y",
            xTransformation: "x^2",
            eTransformation: "((-1/x^2)*e)^2",
            yLabel: "1/I",
            xLabel: "Q^2"
          },
          'Kratky': {
            fit: 'Kratky',
            equation: "m*x+b",
            yTransformation: "log(x^2*y)",
            xTransformation: "x^2",
            eTransformation: "((1/x)*e)^2",
            yLabel: "log(Q^2*I)",
            xLabel: "Log(Q)"
          },
          'Debye Beuche': {
            fit: 'Debye Beuche',
            equation: "m*x+I0",
            yTransformation: "sqrt(y)",
            xTransformation: "x^2",
            eTransformation: "(1/(2*sqrt(x))*e)^2",
            yLabel: "sqrt(I)",
            xLabel: "Q^2"
          }
        },
        scaleConfigurations: {
          'X': d3.scaleLinear(),
          'X^2': d3.scalePow().exponent(2),
          'Log(X)': d3.scaleLog(),
          'Y': d3.scaleLinear(),
          'Y^2': d3.scalePow().exponent(2),
          'Log(Y)': d3.scaleLog()
        },
        defaultFitSettings: {
          damping: 0.001,
          initialValues: [],
          gradientDifference: 0.1,
          maxIterations: 100,
          errorTolerance: 0.001
        },
        fitSettings: {
          damping: 0.001,
          initialValues: [],
          gradientDifference: 0.1,
          maxIterations: 100,
          errorTolerance: 0.001
        }
      }
    },
    methods: {
      fetchData: function () {
        var url = document.getElementById("urlid").getAttribute("data-urlid");
        var files = JSON.parse(url);
        this.getFiles = [];

        // For loop to GET multiple files and push them to an array
        for (var i = 0; i < files.length; i++) {

          // Call 'getFiles' passing in i each time to access appropriate elements in files array
          getFiles(i);

          // Set a variable to 'this' to be able to reference the getFiles variable in the scope of the 'getFiles' function
          var vthis = this;

          function getFiles(i, test) {

            //Make a GET request to data file
            axios.get(files[i].url).then(response => {

              var data = d3.csvParse(response.data, function (d) {
                // The return statement renames the columns
                // and removes spaces/formatting and converts the strings to
                // to numerical values by prefixing with '+'
                return {
                  x: +d['# X '],
                  y: +d[' Y '],
                  error: +d[' E '],
                  dx: +d[' DX'],
                  name: files[i].name
                }
              });

              // Each data file has an empty second row so removing it with splice
              data = data.splice(1, data.length);
              data = data.filter( (d) => d.y > 0 && d.x > 0); // Filter out negative values for x and y

              vthis.getFiles.push({
                data: data,
                fileName: files[i].name,
              });

              // Add filename to color domain
              if (vthis.colorDomain.indexOf(files[i].name) === -1) {
                vthis.colorDomain.push(files[i].name);
              }
            });
          }
        }
      },
      uploadFile: function (files) {
        //var files = document.getElementById("file-upload").files;
        var self = this;

        function loadFiles(file) {
          // Pull the file name and remove the ".txt" extension
          var name = file.name.substr(0, file.name.lastIndexOf('.txt')) || file.name;
          var reader = new FileReader();

          reader.onload = function (e) {
            // Get file content
            var content = e.target.result;
            var data = d3.csvParse(content, function (d) {
              // The return statement renames the columns
              // and removes spaces/formatting and converts the strings to
              // to numerical values by prefixing with '+'
              return {
                x: +d['# X '],
                y: +d[' Y '],
                error: +d[' E '],
                dx: +d[' DX'],
                name: name
              }
            });

            // Each data file has an empty second row so removing it with splice
            data = data.splice(1, data.length);
            data = data.filter( (d) => d.y > 0 && d.x > 0); // Filter out negative values for x and y
            // Once data is read in add it to the uploaded list
            self.uploadedFiles.unshift({
              data: data,
              fileName: name
            });

            // Add filename to color domain
            if (self.colorDomain.indexOf(name) === -1) {
              self.colorDomain.push(name);
            }
          }
          reader.readAsText(file, "UTF-8");
        }

        for (var i = 0; i < files.length; i++) {
          if (files[i].type !== "text/plain") {
            //if text file is not submitted alert and skip over it
            alert("Sorry, " + files[i].type + " is not an accepted file type.")
            continue;
          } else {
            if (this.uploadedFiles.length > 0) {
              if (!this.checkDuplicateFile(files[i].name.substr(0, files[i].name.lastIndexOf('.txt')))) {
                loadFiles(files[i]);
              }
            } else {
              loadFiles(files[i]);
            }
          };
        }

        document.getElementById("file-upload").value = '';
        // reset the file names so the last file uploaded & deleted can be uploaded again with no problems
      },
      checkDuplicateFile: function (filename) {

        if (this.uploadedFiles.find(el => el.fileName === filename)) {
          alert("Duplicate file: " + filename);
          return true;
        } else {
          return false;
        }

      },
      resetPlot: function () {
        this.plotParameters();
      },
      disableButtons: function (bool) {
        this.buttonDis = bool;
      },
      setCurrentData: function (checkedfiles) {
        // Function that adds selected data to be plotted

        if (checkedfiles.length == 0) {
          // If no data is selected to be plotted, then
          // remove any elements previously plotted
          // and reset to default values
          d3.select("svg").remove();
          d3.select(".tooltip").remove();

          eventBus.$emit('reset-scales');
          eventBus.$emit('reset-fit');
          this.disableButtons(false);
          this.selectedData = [];
          this.fileToFit = null;
        } else {
          // console.log(this.selectedData);
          // console.log("checkfiles", checkedfiles);

          // Remove any instances where checked file isn't in selected
          for (let i = 0; i < this.selectedData.length; i++) {
            let key = this.selectedData[i].fileName;
            // console.log("key", key);
            // console.log(this.checkedfiles.indexOf(key));
            if (checkedfiles.indexOf(key) === -1) {
              // console.log("Removing: " + key + " | index: " + i);
              this.selectedData.splice(i, 1);
              
              // Check if you are removing a file that was also being fitted
              // if so reset back to null
              if(key === this.fileToFit) {
                this.fileToFit = null;
              }
            }
          }

          //console.log("Selected Data After", this.selectedData);

          // Add selected file
          for (let i = 0; i < checkedfiles.length; i++) {
            let el = checkedfiles[i];

            if (this.selectedData.find(a => a.fileName === el) === undefined) {
              // console.log("not in selectedData " + el);

              if (this.getFiles.find(a => a.fileName === el)) {
                // console.log("Adding from get file " + el);
                
                // Set temp file for get
                let temp = _.cloneDeep(this.getFiles.find(a => a.fileName === el));
                // console.log("Temp", temp);
                temp.dataTransformed = [];

                if(this.currentConfiguration.fit !== 'None' && this.currentConfiguration.fit !== 'Linear') {
                  temp.dataTransformed = fd.transformData(temp, this.currentConfiguration);
                  // console.log("Temp data:", temp);
                  this.selectedData.push(temp);
                } else {
                  this.selectedData.push(temp);
                }

              } else if (this.uploadedFiles.find(a => a.fileName === el)) {
                // console.log("Adding from uploaded file " + el);
                
                // Set temp file for uploaded
                let temp = _.cloneDeep(this.uploadedFiles.find(a => a.fileName === el));
                temp.dataTransformed = [];

                if(this.currentConfiguration.fit !== 'None' && this.currentConfiguration.fit !== 'Linear') {
                  temp.dataTransformed = fd.transformData(temp, this.currentConfiguration);
                  // console.log("Temp data:", temp);
                  this.selectedData.push(temp);
                } else {
                  this.selectedData.push(temp);
                }
              } else {
                console.log("Uh oh shouldn't happen");
              }
              
            }
          };
        }
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
      },
      setFitFile: function (filename) {
        this.fileToFit = filename;
        // console.log("Current File to Fit", this.fileToFit);
      },
      setScales: function (x, y) {
        this.scales.xScale = this.scaleConfigurations[x];
        this.scales.yScale = this.scaleConfigurations[y];
      },
      setFit: function (fitname) {
        //we deep clone because if you change the equation later, the original fit config's equation would be altered as well
        this.currentConfiguration = _.cloneDeep(this.fitConfigurations[fitname]);
      },
      plotParameters: function () {

        // Make sure there is selected data to plot
        // then pass all parameters into an object
        // when plotting selected data
        if (this.selectedData.length > 0) {
          this.plotCurrentData(this.plotParams);
        }
      },
      prepData: function (sd) {
        // This function is to prepare the data before calling 'plotCurrentData' function
        // The initial array has multiple arrays with objects inside,
        // The for loop strips out the object for just the arrays of data
        // Then D3.merge will do that, merge the arrays of data to one large array of data
        // This is simply to ease the process of plotting (see the nested loop function in 'plotCurrentData.js')
        let temp = [];
        for (let i = 0; i < sd.length; i++) {
          // If a fit is set push transformed data, else push normal data
          if(this.fileToFit === null) {
            temp.push(sd[i].data);
          } else {
            temp.push(sd[i].dataTransformed);
          }
        }
        // console.log("Temp", temp);
        return d3.merge(temp);
      },
      setParameters: function () {
        // Function to wrap up all the parameters needed for plotting
        // console.log("Data", this.selectedData);
        this.plotParams = {
          data: this.prepData(this.selectedData),
          colorDomain: this.colorDomain,
          scales: this.scales,
          fileToFit: this.fileToFit,
          fitConfiguration: this.currentConfiguration,
          fitSettings: this.fitSettings
        };
      },
      setEquation: function(eq) {
        this.currentConfiguration.equation = eq;
      },
      setTransformations: function(x,y) {
        console.log("X: ", x);
        this.currentConfiguration.xTransformation = x;
        this.currentConfiguration.yTransformation = y;
      },
      setFitSettings: function(options) {
        this.fitSettings = options;
      },
      resetTransformation: function() {
        let xt = this.fitConfigurations[this.currentConfiguration.fit].xTransformation;
        let yt = this.fitConfigurations[this.currentConfiguration.fit].yTransformation;
        this.currentConfiguration.xTransformation = xt;
        this.currentConfiguration.yTransformation = yt;
      }
    },
    watch: {
      scales: {
        handler: function() {
          // Watch if scales change, if so re-set parameters
          this.setParameters();
        },
        deep: true
      },
      fileToFit: function () {
        // Watch if fileToFit changes, if so assign/re-assign selectedData.dataFitted       	
        // If fileToFit is set to Null, don't transform anything and reset the fit to none
        if(this.fileToFit === null) {
          // Reset fit to Linear
          eventBus.$emit("set-fit-back");
          eventBus.$emit("set-fit-settings-back");
          this.setFit("Linear"); 
        } else {
          this.selectedData.forEach( el => {
              el.dataTransformed = fd.transformData(el, this.currentConfiguration);
            });
        }
      },
      selectedData: {
        handler: function() {
          // Watch if selectedData changes, if so 
          // check if a fit is enabled and transform data if necessary
          // then set new plot parameters
          // console.log("Selected changed...", this.selectedData);
          this.setParameters();
        },
        deep: true
      },
      currentConfiguration: {
        handler: function() {
          // Watch if 'currentConfiguration' gets changed, if so
          // re-transform selected data according to 'xTransformation' and 'yTransformation'
          // then re-fit the 'dataToFit' according to the config's equation
          // console.log("Equation changed...", this.currentConfiguration.equation);
          if(this.fileToFit !== null) {
            //When current data changes after selected
            console.log("re-transforming...");
            this.selectedData.forEach( el => {
              el.dataTransformed = fd.transformData(el, this.currentConfiguration);
            })
            // this.transformedData = fd.transformData(this.selectedData, this.currentConfiguration);
          } else {
            this.selectedData.forEach( el => {
              el.dataTransformed = []; // reset since transformed data is 'None' or 'Linear'
            });
          }
        },
        deep: true
      },
      plotParams: function () {
        // Watch for any changes to plotParams, if so plot data
        if (this.selectedData.length > 0) {
          this.plotCurrentData(this.plotParams);
        }
      },
      uploadedFiles: function () {
        // Watch if a file has been uploaded, if so enable delete file buttons
        if (this.uploadedFiles.length > 0) {
          this.isUploaded = true;
        } else {
          this.isUploaded = false;
        }
      },
      fitSettings: {
        handler: function() {
          this.setParameters();
        },
        deep: true
      }
    }
  }
</script>

<style scoped>
@import '../assets/styles/main-component-styles.css';
@import '../assets/styles/plot-styles.css';
</style>
