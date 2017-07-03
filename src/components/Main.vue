<template>
  <div class="row main">

    <!--Pass functions to controls component-->
      <div 
        :class="!isCollapseLeft ? 'col-xs-1' : 'col-xs-0'" v-show="!isCollapseLeft">
        
        
        <app-controls
        :RESETPLOT="resetPlot"
        :BUTTONDIS="buttonDis"
        :PLOTPARAMS="plotParams"
        :RESETPARAMS="resetParams"
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
      plotParams: {
        data: [],
        xScale: "X",
        yScale: "Y",
        xAxisTitle: 'X',
        yAxisTitle: 'I(Q)',
        fitName: 'None',
        equation: 'a*X+b',
        fileToFit: null
      },
      isUploaded: false,
      isCollapseRight: false,
      isCollapseLeft: false,
      buttonDis: false
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

        for(var i = 0; i < this.uploadedFiles.length; i++) {
          if(filename == this.uploadedFiles[i].fileName) {
            alert("Duplicate file: " + filename);
            return true;
          }
        }
        return false;
    },
    resetPlot: function() {
      this.plotCurrentData(this.plotParams, this.colorDomain);
    },
    disableButtons: function (bool) {
      this.buttonDis = bool;
    },
    resetParams: function() {
      this.plotParams.fitName = "None";
      this.plotParams.fileToFit = null;
      this.plotParams.xScale = "X";
      this.plotParams.yScale = "Y";
      this.plotParams.xAxisTitle = "X";
      this.plotParams.yAxisTitle = "I(Q)";
      this.plotParams.equation = "a*X+b";
      //this.plotParams.data = [];
    },
    setCurrentData: function(checkedfiles) {
      if(checkedfiles.length == 0) {
        this.disableButtons(false);
        this.plotParams.data = [];
        //this.resetParams();
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
        var mergearrays = d3.merge(tempdata);
        this.plotParams.data = mergearrays;
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
      this.plotParams.fileToFit = filename;
    }
  },
    watch: {
      plotParams: {
        handler: function() {
          if(this.plotParams.data.length > 0) {
            // console.log(this.plotParams);
            this.plotCurrentData(this.plotParams, this.colorDomain);
          } else {
            //this will be the code to reset plot to nothing
            d3.select("svg").remove();
            d3.select(".tooltip").remove();
          }
        },
        deep: true
    },
      uploadedFiles: function(){
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
