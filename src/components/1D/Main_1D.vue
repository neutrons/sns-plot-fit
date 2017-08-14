<template>
  <div id="main1D" class="col-md-12">
    <div class="container-fluid">

      <div id="left-sidebar" class="col-md-2">

          <!--Pass variables to fileload component-->
            <app-files
            :BUTTONDIS="buttonDis"
            :GETFILES="getFiles"
            :UPLOADEDFILES="uploadedFiles"
            :ISUPLOADED="isUploaded"
            ></app-files>

        <!--Pass variables to controls component-->
            <app-controls
            :BUTTONDIS="buttonDis"
            :FILETOFIT="fileToFit"
            :EQUATION="$data.currentConfiguration.equation"
            :XTRANS="$data.currentConfiguration.xTransformation"
            :YTRANS="$data.currentConfiguration.yTransformation"
            :FITS="fitConfigurations"
            ></app-controls>

      </div>
          
      <app-plot 
        :BUTTONDIS="buttonDis"
        :FILETOFIT="fileToFit"
      ></app-plot>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import * as axios from 'axios'; // Axios package to handle HTTP requests
import * as _ from 'lodash';
import $ from 'jquery';
import pp from 'papaparse';
import Controls from './ControlsPanel_1D.vue';
import Files from './FilePanel_1D.vue';
import Plot from './Plot_1D.vue';

import fd from '../../assets/javascript/fitData.js';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

export default {
    name: 'main1D',
    components: {
      'app-controls': Controls,
      'app-files': Files,
      'app-plot': Plot
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

      // Event hooks for 'Title.vue'
      eventBus.$on('add-get-1D', this.addGetData);
      eventBus.$on('add-uploaded-1D', this.addUploadedData);
      eventBus.$on('check-duplicate', this.checkDuplicateFile);
    },
    mounted() {
    // Code for Collapsible panels
      $('#plot-panel-collapse').click(function(e) {
          $('#plot-panel-collapse').find('span').toggleClass('glyphicon-menu-up glyphicon-menu-down');
          $("#plot-collapse").slideToggle(300);
      });

      $('#control-panel-collapse').click(function(e) {
          $('#control-panel-collapse').find('span').toggleClass('glyphicon-menu-up glyphicon-menu-down');
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
          xScaleType: 'X',
          yScale: d3.scaleLinear(),
          yScaleType: 'Y'
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
            xLabel: "Q",
            note: ""
        },
        fitConfigurations: {
          'None': {
            fit: 'None',
            equation: null,
            yTransformation: 'y',
            xTransformation: 'x',
            eTransformation: 'e',
            yLabel: "I",
            xLabel: "Q",
            note: ""
          },
          'Linear': {
            fit: 'Linear',
            equation: 'm*x+b',
            yTransformation: 'y',
            xTransformation: 'x',
            eTransformation: "e",
            yLabel: "I",
            xLabel: "Q",
            note: ""
          },
          'Guinier': {
            fit: 'Guinier',
            equation: "-Rg^2/3*x+I0",
            yTransformation: "log(y)",
            xTransformation: "x^2",
            eTransformation: "((1/x)*e)^2",
            yLabel: "Log(I(q))",
            xLabel: "q^2",
            note: ""
          },
          'Low-Q Guinier': {
            fit: 'Low-Q Guinier',
            equation: "-(L^2/12+R^2/2)/3*x+I0",
            yTransformation: "log(y)",
            xTransformation: "x^2",
            eTransformation: "((1/x)*e)^2",
            yLabel: "Log(I(q))",
            xLabel: "q^2",
            note: "Cylinder of length L and Radius R"
          },
          'Intermediate-Q Guinier': {
            fit: 'Intermediate-Q Guinier',
            equation: "-(R^2/2)/3*x+I0/x",
            yTransformation: "log(x*y)",
            xTransformation: "x^2",
            eTransformation: "((1/x)*e)^2",
            yLabel: "Log(q*I(q))",
            xLabel: "q^2",
            note: "Radius R"
          },
          'Flat Object Guinier': {
            fit: 'Flat Object Guinier',
            equation: "-(T^2/12)/3*x+I0/x^2",
            yTransformation: "log(x^2*y)",
            xTransformation: "x^2",
            eTransformation: "((1/x)*e)^2",
            yLabel: "Log(q^2*I(q))",
            xLabel: "q^2",
            note: "T is the thickness of a flat (lamella) object."
          },
          'Porod': {
            fit: 'Porod',
            equation: "log10(A)-n*log10(x)",
            yTransformation: "log10(y)",
            xTransformation: "log10(x)",
            eTransformation: "(1/y * e)^2",
            yLabel: "Log10(I(q))",
            xLabel: "Log10(q)",
            note: "This is valid for high Q."
          },
          'Zimm': {
            fit: 'Zimm',
            equation: "1/I0+Cl^2/I0*x",
            yTransformation: "1/y",
            xTransformation: "x^2",
            eTransformation: "((-1/x^2)*e)^2",
            yLabel: "1/I(q)",
            xLabel: "q^2",
            note: ""
          },
          'Kratky': {
            fit: 'Kratky',
            equation: "m*x+b",
            yTransformation: "x^2*log(y)",
            xTransformation: "x",
            eTransformation: "(2*x*log(y))^2 + (x^2/y * e)^2",
            yLabel: "q^2 \times log(I)",
            xLabel: "q",
            note: ""
          },
          'Debye Beuche': {
            fit: 'Debye Beuche',
            equation: "m*x+I0",
            yTransformation: "sqrt(y)",
            xTransformation: "x^2",
            eTransformation: "(1/(2*sqrt(x))*e)^2",
            yLabel: "sqrt(I)",
            xLabel: "Q^2",
            note: ""
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
      addGetData: function(data) {
        this.getFiles.push(data);

        // Add filename to color domain
        if (this.colorDomain.indexOf(data.fileName) === -1) {
          this.colorDomain.push(data.fileName);
        }
      },
      addUploadedData: function(data) {
        // Add data to uploaded files list
        this.uploadedFiles.unshift(data);

        // Add filename to color domain
        if (this.colorDomain.indexOf(data.fileName) === -1) {
          this.colorDomain.push(data.fileName);
        }
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
        // Function that adds selected data to be plotted

        if (checkedfiles.length == 0) {
          // If no data is selected to be plotted, then
          // remove any elements previously plotted
          // and reset to default values
          console.log("Removing plot elements...");
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
                // temp.dataTransformed = [];

                if(this.currentConfiguration.xTransformation !== 'x' || this.currentConfiguration.yTransformation !== 'y') {
                  temp.dataTransformed = fd.transformData(temp, this.currentConfiguration);
                  // console.log("Temp data:", temp);
                  this.selectedData.push(temp);
                } else {
                  temp.dataTransformed = _.cloneDeep(temp.data);
                  this.selectedData.push(temp);
                }

              } else if (this.uploadedFiles.find(a => a.fileName === el)) {
                // console.log("Adding from uploaded file " + el);
                
                // Set temp file for uploaded
                let temp = _.cloneDeep(this.uploadedFiles.find(a => a.fileName === el));
                // temp.dataTransformed = [];

                if(this.currentConfiguration.xTransformation !== 'x' || this.currentConfiguration.yTransformation !== 'y') {
                  temp.dataTransformed = fd.transformData(temp, this.currentConfiguration);
                  // console.log("Temp data:", temp);
                  this.selectedData.push(temp);
                } else {
                  temp.dataTransformed = _.cloneDeep(temp.data);
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
        this.scales.xScaleType = x;
        this.scales.yScale = this.scaleConfigurations[y];
        this.scales.yScaleType = y;
      },
      setFit: function (fitname) {
        //we deep clone because if you change the equation later, the original fit config's equation would be altered as well
        this.currentConfiguration = _.cloneDeep(this.fitConfigurations[fitname]);
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
            temp.push(sd[i].dataTransformed);
        }
        // console.log("Temp", temp);
        return d3.merge(temp);
      },
      setParameters: function () {
        // Function to wrap up all the parameters needed for plotting
        // console.log("Data", this.selectedData);
        if(this.selectedData.length > 0) {
          eventBus.$emit("set-parameters", {
            data: this.prepData(this.selectedData),
            colorDomain: this.colorDomain,
            scales: this.scales,
            fileToFit: this.fileToFit,
            fitConfiguration: this.currentConfiguration,
            fitSettings: this.fitSettings
          });
        } else {
          console.log("No data to plot...");
          //reset brush selection
          eventBus.$emit("reset-brush-selection");
        }
      },
      setEquation: function(eq) {
        this.currentConfiguration.equation = eq;
      },
      setTransformations: function(x,y) {
        //console.log("X: ", x);
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
          if(this.currentConfiguration.xTransformation !== 'x' || this.currentConfiguration.yTransformation !== 'y') {
            //When current data changes after selected
            console.log("re-transforming...");
              this.selectedData.forEach( el => {
                el.dataTransformed = fd.transformData(el, this.currentConfiguration);
              });
            // this.transformedData = fd.transformData(this.selectedData, this.currentConfiguration);
          } else {
            this.selectedData.forEach( el => {
              el.dataTransformed = _.cloneDeep(el.data); // reset since transformed data is 'None' or 'Linear'
            });
          }
        },
        deep: true
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
@import '../../assets/styles/main-component-styles.css';
</style>
