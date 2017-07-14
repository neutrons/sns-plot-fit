<template>
  <div class="row main">
    
    <!--Pass functions to controls component-->
      <div 
        :class="!isCollapseLeft ? 'col-xs-1' : 'col-xs-0'" v-show="!isCollapseLeft">
           
        <app-controls
        :RESETPLOT="resetPlot"
        :BUTTONDIS="buttonDis"
        :SETSCALES="setScales"
        :FILETOFIT="fileToFit"
        :SETFIT="setFit"
        :EQUATION="$data.currentConfiguration.equation"
        v-on:set-equation="setEquation"
        ></app-controls>
      </div>

    <div :class="!isCollapseLeft && !isCollapseRight ? 'col-sm-9 plotpanel' : 
                  !isCollapseLeft && isCollapseRight ? 'col-sm-11 plotpanel' : 
                  isCollapseLeft && !isCollapseRight ? 'col-sm-10 plotpanel' : 'col-sm-12 plotpanel'">
   
      <button class="btn btn-default btn-xs btn-collapse-right" @click="isCollapseRight = !isCollapseRight">
        <span class="glyphicon glyphicon-minus" v-if="!isCollapseRight"></span>
        <span class="glyphicon glyphicon-plus" v-if="isCollapseRight"></span>
      </button>

      <button class="btn btn-default btn-xs btn-collapse-left" @click="isCollapseLeft = !isCollapseLeft">
         <span class="glyphicon glyphicon-minus" v-if="!isCollapseLeft"></span>
          <span class="glyphicon glyphicon-plus" v-if="isCollapseLeft"></span>
      </button>

      <div class="plotarea">
          <div class="plot"></div>
      </div>
    </div>

      <!--Pass functions to fileload component-->
      <div :class="!isCollapseRight ? 'col-xs-2' : 'col-xs-0'" 
           v-show="!isCollapseRight" style="padding:0px;">
          
        <app-file-load
        :BUTTONDIS="buttonDis"
        :DISABLEBUTTONS="disableButtons"
        :GETFILES="getFiles"
        :SETCURRENTDATA="setCurrentData"
        :READFILE="readFile"
        :UPLOADEDFILES="uploadedFiles"
        :FETCHDATA="fetchData"
        :DELETEFILE="deleteFile"
        :REMOVEUPLOADED="removeUploaded"
        :ISUPLOADED="isUploaded"
        :SETFITFILE="setFitFile"
        ></app-file-load>
      </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import * as axios from 'axios'; // Axios package to handle HTTP requests
import * as _ from 'lodash';
import plotCurrentData from '../mixins/plotCurrentData';
import Controls from './Controls.vue';
import FileLoad from './FileLoad.vue';

import fd from '../mixins/fitData.js';

export default {
  mixins: [plotCurrentData],
    components: {
      'app-controls': Controls,
      'app-file-load': FileLoad
    },
    data: function () {
      return {
        getFiles: [],
        uploadedFiles: [],
        colorDomain: [],
        selectedData: [],
        xScale: d3.scaleLinear(),
        yScale: d3.scaleLinear(),
        fileToFit: null,
        prevFileToFit: null,
        xTitle: 'X',
        yTitle: 'Y',
        isUploaded: false,
        isCollapseRight: false,
        isCollapseLeft: false,
        buttonDis: false,
        plotParams: {},
        currentConfiguration: {
            fit: 'None',
            equation: null,
            yTransformation: null,
            xTransformation: null,
            yLabel: "I",
            xLabel: "Q",
            range: [-Infinity, +Infinity]
        },
        fitConfigurations: {
          'None': {
            fit: 'None',
            equation: null,
            yTransformation: null,
            xTransformation: null,
            yLabel: "I",
            xLabel: "Q",
            range: [-Infinity, +Infinity]
          },
          'Linear': {
            fit: 'Linear',
            equation: 'm*X+b',
            yTransformation: 'y',
            xTransformation: 'x',
            yLabel: "I",
            xLabel: "Q",
            range: [-Infinity, +Infinity]
          },
          'Guinier': {
            fit: 'Guinier',
            equation: "-Rg^2/3*X+b",
            yTransformation: "log(y)",
            xTransformation: "x^2",
            yLabel: "Log(I)",
            xLabel: "Q^2",
            range: [-Infinity, +Infinity]
          },
          'Porod': {
            fit: 'Porod',
            equation: "A-n*X",
            yTransformation: "log(y)",
            xTransformation: "log(x)",
            yLabel: "Log(I)",
            xLabel: "Log(Q)",
            range: [-Infinity, +Infinity]
          },
          'Zimm': {
            fit: 'Zimm',
            equation: "1/I0+Cl^2/I0*X",
            yTransformation: "1/y",
            xTransformation: "x^2",
            yLabel: "1/I",
            xLabel: "Q^2",
            range: [-Infinity, +Infinity]
          },
          'Kratky': {
            fit: 'Kratky',
            equation: "m*X+b",
            yTransformation: "log(x^2*y)",
            xTransformation: "x^2",
            yLabel: "log(Q^2*I)",
            xLabel: "Log(Q)",
            range: [-Infinity, +Infinity]
          },
          'Debye Beuche': {
            fit: 'Debye Beuche',
            equation: "m*X+I0",
            yTransformation: "sqrt(y)",
            xTransformation: "x^2",
            yLabel: "sqrt(I)",
            xLabel: "Q^2",
            range: [-Infinity, +Infinity]
          }
        },
        scales: {
          'X': d3.scaleLinear(),
          'X^2': d3.scalePow().exponent(2),
          'Log(X)': d3.scaleLog().clamp(true),
          'Y': d3.scaleLinear(),
          'Y^2': d3.scalePow().exponent(2),
          'Log(Y)': d3.scaleLog().clamp(true)
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
      readFile: function () {
        var files = document.getElementById("input").files;
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

          this.disableButtons(false);
          this.selectedData = [];
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
                temp.dataFitted = []; // Initialize an empty fitted data array for later use

                if(this.currentConfiguration.fit !== 'None' && this.currentConfiguration.fit !== 'Linear') {
                  temp.dataTransformed = fd.transformData(temp, this.currentConfiguration);
                  // console.log("Temp data:", temp);
                  this.selectedData.push(temp);
                } else {
                  this.selectedData.push(temp);
                }
                // this.selectedData.push(this.getFiles.find(a => a.fileName === el));

              } else if (this.uploadedFiles.find(a => a.fileName === el)) {
                // console.log("Adding from uploaded file " + el);
                
                // Set temp file for uploaded
                let temp = _.cloneDeep(this.uploadedFiles.find(a => a.fileName === el));
                temp.dataTransformed = [];
                temp.dataFitted = []; // Initialize an empty fitted data array for later use

                if(this.currentConfiguration.fit !== 'None' && this.currentConfiguration.fit !== 'Linear') {
                  temp.dataTransformed = fd.transformData(temp, this.currentConfiguration);
                  // console.log("Temp data:", temp);
                  this.selectedData.push(temp);
                } else {
                  this.selectedData.push(temp);
                }
                // this.selectedData.push(this.uploadedFiles.find(a => a.fileName === el));
              } else {
                console.log("Uh oh shouldn't happen");
              }
              
            }
          };

          // console.log("Selected Data", this.selectedData);
          // console.log("length is " + this.selectedData.length);

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
      removeUploaded: function () {
        this.uploadedFiles = [];
      },
      setFitFile: function (filename) {
        this.prevFileToFit = this.fileToFit;
        console.log("Previous File to Fit", this.prevFileToFit);
        this.fileToFit = filename;
        console.log("Current File to Fit", this.fileToFit);
      },
      setScales: function (x, y) {
        this.xTitle = x;
        this.yTitle = y;
        this.xScale = this.scales[x];
        this.yScale = this.scales[y];
      },
      setFit: function (fitname) {
        this.currentConfiguration = _.cloneDeep(this.fitConfigurations[fitname]); //we deep clone because if you change the equation later, the original fit config's equation would be altered as well
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
        var temp = [];
        for (let i = 0; i < sd.length; i++) {
          // If a fit is set push transformed data, else push normal data
          if(this.currentConfiguration.fit === 'None' || this.currentConfiguration.fit === 'Linear') {
            temp.push(sd[i].data);
          } else {
            temp.push(sd[i].dataTransformed);
          }
        }
        // console.log("Temp", temp);
        return d3.merge(temp);
      },
      getFittedData: function (sd) {
        let temp = [];
        for(let i = 0; i < sd.length; i++) {
          if(sd[i].fileName === this.fileToFit) {
            temp.push(sd[i].dataFitted);
          }
        }

        return temp;
      },
      setParameters: function () {
        // Function to wrap up all the parameters needed for plotting
        this.plotParams = {
          data: this.prepData(this.selectedData),
          colorDomain: this.colorDomain,
          xScale: this.xScale,
          yScale: this.yScale,
          fittedData: this.getFittedData(this.selectedData),
          xTitle: this.xTitle,
          yTitle: this.yTitle
        };
      },
      setEquation: function(eq) {
        this.currentConfiguration.equation = eq;
      }
    },
    watch: {
      xScale: function () {
        // Watch if xScale changes, if so update parameters then re-plot
        this.setParameters();
      },
      yScale: function () {
        // Watch if yScale changes, if so update parameters then re-plot
        this.setParameters();
      },
      fileToFit: function () {
        // Watch if fileToFit changes, if so at populate dataToFit with chosen data

        // if(this.fileToFit !== null) {
        //   this.selectedData.forEach( (d) => {
 
        //     if(d.fileName === this.fileToFit) {
        //       d.data.forEach( (el) => {
        //         this.dataToFit.x.push(el.x);
        //         this.dataToFit.y.push(el.y);
        //       })
        //     }
        //   });
        // }

        // console.log("File to Fit Changed...");
        // console.log("Previous:", this.prevFileToFit);
        // console.log("Current:", this.fileToFit);
        // console.log("Selected Data Before:", this.selectedData[0].dataFitted);
       	
        // If fileToFit is set to Null, don't transform anything and reset the fit to none
        if(this.fileToFit === null) {
          console.log("Resetting configurations...");
          this.setFit('None');
        } else {

        for(let i=0; i < this.selectedData.length; i++) {
            let el = this.selectedData[i].fileName;
            // console.log("El:", el);
            
            // Find previous file to fit's fitted data a reset it to an empty array
            if(el === this.prevFileToFit) {
              this.selectedData[i].dataFitted = [];
            }
            
            // Find new file to fit and set the array to fitted data points
            if(el === this.fileToFit) {
              this.selectedData[i].dataFitted = fd.fitData(this.selectedData[i], this.currentConfiguration);
            }
          }
        }
      },
      selectedData: {
        handler: function() {
          // Watch if selectedData changes, if so 
          // check if a fit is enabled and transform data if necessary
          // then set new plot parameters
          // console.log("Selected changed...", this.selectedData);
          this.setParameters();

          // if(this.selectedData.length > 0) {
          //   // this.setConfigurations();
          //   //this.plotParams = this.configurations[this.fitName];
          //   //this.plotParams.data = this.selectedData;
          //   //this.plotParams.colorDomain = this.colorDomain;
          //   //this.plotParameters();
          //   this.setParameters();
          // }
        },
        deep: true
      },
      currentConfiguration: {
        handler: function() {
          // Watch if 'currentConfiguration' gets changed, if so
          // re-transform selected data according to 'xTransformation' and 'yTransformation'
          // then re-fit the 'dataToFit' according to the config's equation
          // console.log("Equation changed...", this.currentConfiguration.equation);
          if(this.currentConfiguration.fit !== 'None' && this.currentConfiguration.fit !== 'Linear') {
            //When current data changes after selected
            this.selectedData.forEach( el => {
              el.dataTransformed = fd.transformData(el, this.currentConfiguration);
              
              // Re-fit data according to new fit equation
              if(el.fileName === this.fileToFit) {
                el.dataFitted = fd.fitData(el, this.currentConfiguration);
              }
            })
            // this.transformedData = fd.transformData(this.selectedData, this.currentConfiguration);
          } else {
            this.selectedData.forEach( el => {
              el.dataTransformed = []; // reset since transformed data is 'None' or 'Linear'

              // Only re-fit data if it's linear...you don't fit a line that is 'none'
              if(el.fileName === this.fileToFit && this.currentConfiguration.fit === 'Linear') {
                el.dataFitted = fd.fitData(el, this.currentConfiguration);
              }
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
      }
    }
  }
</script>

<style scoped>
@import '../styles/main-component-styles.css';
</style>
