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
        :EQUATION="equation"
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
import * as axios from 'axios'; //axios package to handle GET requests
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
      fitName: 'None',
      equation: '',
      fileToFit: null,
      dataToFit: { x: [],
                   y: []
      },
      fittedData: [],
      xTitle: 'X',
      yTitle: 'I(Q)',
      isUploaded: false,
      isCollapseRight: false,
      isCollapseLeft: false,
      buttonDis: false,
      plotParams: {},
      configurations: {
          'None': {
              equation: null,
              yTransformation: null,
              xTransformation: null,        
              yLabel: "I",
              xLabel: "Q",
              range: [-Infinity, +Infinity],
          },
          'Linear': {
              equation: 'm*X+b',
              yTransformation: 'y',
              xTransformation: 'x',        
              yLabel: "I",
              xLabel: "Q",
              range: [-Infinity, +Infinity],
          },
          'Guinier': {
              equation: "-Rg^2/3*X+b",
              yTransformation: "log(y)",
              xTransformation: "x^2",        
              yLabel: "Log(I)",
              xLabel: "Log(Q)",
              range: [-Infinity, +Infinity],
          },
          'Porod': {
              equation: "A-n*X",
              yTransformation: "log(y)",
              xTransformation: "log(x)",        
              yLabel: "Log(I)",
              xLabel: "Log(Q)",
              range: [-Infinity, +Infinity],
              },
          'Zimm': {
              equation: "1/I0+Cl^2/I0*X",
              yTransformation: "log(y)",
              xTransformation: "x^2",        
              yLabel: "1/I",
              xLabel: "Q^2",
              range: [-Infinity, +Infinity],
          },
          'Kratky': {
              equation: "m*X+b",
              yTransformation: "log(y)",
              xTransformation: "x^2",        
              yLabel: "log(Q^2*I)",
              xLabel: "Log(Q)",
              range: [-Infinity, +Infinity],
          },
          'Debye Beuche': {
              equation: "m*X+I0",
              yTransformation: "log(y)",
              xTransformation: "x^2",        
              yLabel: "sqrt(I)",
              xLabel: "Q^2",
              range: [-Infinity, +Infinity],
          }
    },
    scales: {
      'X': d3.scaleLinear(),
      'X^2': d3.scalePow().exponent(2),
      'Log(X)': d3.scaleLog(),
      'Y': d3.scaleLinear(),
      'Y^2': d3.scalePow().exponent(2),
      'Log(Y)': d3.scaleLog()
    }
  }
  },
  methods: {
    fetchData: function () {
      var url = document.getElementById("urlid").getAttribute("data-urlid");
      var files = JSON.parse(url);
      this.getFiles = [];

      //For loop to GET multiple files and push them to an array
      for (var i = 0; i < files.length; i++) {

        //call get files passing in i each time to access appropriate elements in files array
        getFiles(i);

        //Set a variable to call 'this' to essentially reference the getFiles variable in the getFiles function
        var vthis = this;

        function getFiles(i, test) {

          //Make a GET request to data file
          axios.get(files[i].url).then(response => {

            /* CODE FOR READING TXT FILES WITH COMMA DELIMITER*/
            var data = d3.csvParse(response.data, function (d) {
              //the return statement basically renames the columns
              //to remove spaces, as well as converts the strings to
              //to numerical values with prefixing with '+'
              return {
                x: +d['# X '],
                y: +d[' Y '],
                error: +d[' E '],
                dx: +d[' DX'],
                name: files[i].name
              }
            });

            //each data file has an empty second row so removing it with splice
            data = data.splice(1, data.length);
            /***** END CSV FILE CODE*/

            vthis.getFiles.push({
              data: data,
              fileName: files[i].name,
            });

            //add filename to color domain
            if(vthis.colorDomain.indexOf(files[i].name) === -1) { vthis.colorDomain.push(files[i].name); }
          });
        }
      }
    },
    readFile: function() {
      var files = document.getElementById("input").files;
      var self = this;

      function loadFiles(file) {
        //pull the file name and remove the ".txt" extension
        var name = file.name.substr(0, file.name.lastIndexOf('.txt')) || file.name;
        var reader = new FileReader();

        reader.onload = function (e) {
          //get file content
          var content = e.target.result;

          /*** CODE FOR READING TXT FILES WITH COMMA DELIMITER*/
          var data = d3.csvParse(content, function (d) {
            //the return statement basically renames the columns
            //to remove spaces, as well as converts the strings to
            //to numerical values with prefixing with '+'
            return {
              x: +d['# X '],
              y: +d[' Y '],
              error: +d[' E '],
              dx: +d[' DX'],
              name: name
            }
          });

          //each data file has an empty second row so removing it with splice
          data = data.splice(1, data.length);
          /***** END CSV FILE CODE*/

          //once data is read in add it to the array list
          self.uploadedFiles.unshift({
            data: data,
            fileName: name
          });

          //add filename to color domain
          if(self.colorDomain.indexOf(name) === -1) { self.colorDomain.push(name); }
        }
        reader.readAsText(file, "UTF-8");
      }

      for (var i = 0; i < files.length; i++) {
        if(files[i].type !== "text/plain") {
          //if text file is not submitted alert and skip over it
          alert("Sorry, " + files[i].type + " is not an accepted file type.")
          continue;
        } else {
          if(this.uploadedFiles.length > 0) {
            if(!this.checkDuplicateFile(files[i].name.substr(0, files[i].name.lastIndexOf('.txt')))) {
              loadFiles(files[i]);
            }
          } else {
            loadFiles(files[i]);
          }
        };
      }
    },
    checkDuplicateFile: function(filename) {

        if(this.uploadedFiles.find( el => el.fileName === filename)) {
          alert("Duplicate file: " + filename);
          return true;
        } else { return false; }
        
    },
    resetPlot: function() {
      // this.plotCurrentData({
      //     colorDomain: this.colorDomain,
      //     data: this.selectedData,
      //     equation: this.equation,
      //     fitName: this.fitName,
      //     xScale: this.xScale,
      //     yScale: this.yScale,
      //     fileToFit: this.fileToFit,
      //     xTitle: this.xTitle,
      //     yTitle: this.yTitle
      //   });
      this.plotParameters();
    },
    disableButtons: function (bool) {
      this.buttonDis = bool;
    },
    resetParams: function() {
      this.fitName = 'None';
      this.xTitle = 'X';
      this.yTitle = 'I(Q)';
      this.equation = 'a*X+b';
      this.fileToFit = null;
    },
    setCurrentData: function(checkedfiles) {
      if(checkedfiles.length == 0) {
        this.disableButtons(false);
        this.dataToFit = {x:[], y:[]};
        this.equation = null;
        //Remove any elements previously plotted
        d3.select("svg").remove();
        d3.select(".tooltip").remove();
        this.selectedData = [];
      } else {
          var tempdata = []

          //add selected files from the GET requested data
          for(var i = 0; i < checkedfiles.length; i++) {
            for(var j = 0; j < this.getFiles.length; j++) {
              if(this.getFiles[j].fileName === checkedfiles[i]) {
                tempdata.push(this.getFiles[j].data);
              }
            }
          }

          //add selected files form the uploaded data
          for(var i = 0; i < checkedfiles.length; i++) {
            for(var j = 0; j < this.uploadedFiles.length; j++) {
              if(this.uploadedFiles[j].fileName === checkedfiles[i]) {
                tempdata.push(this.uploadedFiles[j].data);
              }
            }
          }
        
        //merge tempdata so that you have one large array of objects
        //this is to make plotting easier for multiple files selected
        this.selectedData = d3.merge(tempdata);
      }
    },
    deleteFile: function(filename) {
      for (var i = 0; i < this.uploadedFiles.length; i++) {
        if (this.uploadedFiles[i].fileName === filename) {
          //Splice will remove the object from array index i    
          this.uploadedFiles.splice(i, 1);
        }
      }
    },
    removeUploaded: function() {
      this.uploadedFiles = [];
    },
    setFitFile: function(filename) {
      this.fileToFit = filename;
    },
    setScales: function(x,y) {
      this.xScale = this.scales[x];
      this.yScale = this.scales[y];
    },
    setFit: function(fitname) {
      this.fitName = fitname;
    },
    plotParameters: function() {
      
      //make sure there is selected data to plot
      //then pass all parameters into an object
      //when plotting selected data
      if(this.selectedData.length > 0) {
        //   this.plotCurrentData({
        //   data: this.selectedData,
        //   colorDomain: this.colorDomain,
        //   equation: this.equation,
        //   fitName: this.fitName,
        //   xScale: this.xScale,
        //   yScale: this.yScale,
        //   xTitle: this.xTitle,
        //   yTitle: this.yTitle,
        //   fileToFit: this.fileToFit
        // });
        this.plotCurrentData(this.plotParams);
      }
    },
    setConfigurations: function() {
      //this.plotParams = this.configurations[this.fitName];
      this.plotParams.data = this.selectedData;
      this.plotParams.colorDomain = this.colorDomain;
      this.plotParams.xScale = this.xScale;
      this.plotParams.yScale = this.yScale;
      this.plotParams.fittedData = this.fittedData;
      this.plotParams.equation = this.equation;
      this.plotParams.xTitle = this.xTitle;
      this.plotParams.yTitle = this.yTitle;

      //this.equation = this.plotParams.equation; //Here is where it is messing up...
      // console.log(this.plotParams);
    }
  },
    watch: {
      xScale: function() {
        //watch if xScale changes, if so plot data with new parameters
        //Need to fix for later...updating the scales to plot
        //Perhaps switch the string list in Controls to be an object,
        //and you display the key strings for selection, but they pass a
        //d3 scale upon selection.
        this.plotParameters();
      },
      yScale: function() {
        //watch if yScale changes, if so plot data with new parameters
        this.plotParameters();
      },
      fitName: function() {
        //if Fit name is changed set new configurations
        this.setConfigurations();

        // this.equation = this.plotParams.equation;
        // console.log(this.plotParams);

        // this.configurations.forEach(function(el){
        //   if(el.fitName === this.fitName) {
        //     this.equation = el.equation; //update equation for fitted's
        //     var xFunction = math.parse(conf.xTransformation).compile();
        //     conf.newXValues = function (x) { x.map(function (i) { xFunction.eval({x:i}) })};
        //   }
        // })
      },
      fileToFit: function() {
        //watch if fileToFit changes from null, if so fit data accordingly
        // this.plotParameters();

        //watch if fit name changes from 'None', if so set configurations by fit name
        if(this.fileToFit !== null) {
          this.selectedData.forEach( (d) => {
            if(d.name === this.fileToFit) {
              this.dataToFit.x.push(d.x);
              this.dataToFit.y.push(d.y);
            }
          });
          this.setConfigurations(); //change to default fit 'linear'
        }

      },
      equation: function() {
        //watch if equation changes, if so re-plot data to transformed data
        if(this.equation !== null) {
          console.log("equation not null");
          this.fittedData = fd.fitData(this.dataToFit, this.equation);
        } else {
          //plot parameters
          console.log("Hey we're about to plot");
          this.plotParameters();
        }
      },
      selectedData: function() {
        //watch if selectedData changes, if so plot data with new parameters
        if(this.selectedData.length > 0) {
          // this.setConfigurations();
          //this.plotParams = this.configurations[this.fitName];
          //this.plotParams.data = this.selectedData;
          //this.plotParams.colorDomain = this.colorDomain;
          //this.plotParameters();
          this.setConfigurations();
        }
      },
      fittedData: function() {
        //watch if fitted data changes, if so, plot configs with new fitted data
        this.plotParams.fittedData = this.fittedData;
        this.plotParameters();
      },
      uploadedFiles: function(){
        //watch if a file is uploaded, if so enable delete file button
        if(this.uploadedFiles.length > 0) {
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
