<template>
  <div id="New1D" class="col-md-12">
      <div class="container-fluid">
      <div class="col-md-2">
        
        <!-- Files Main Panel  -->
        <v-panel-group MAINTITLE="Files" PANELTYPE="primary">

            <!-- Fetched Data Panel  -->
                <v-panel PANELTITLE="Fetched Data" PANELTYPE="success">
                    <div v-show="fetchFiles.length > 0">
                        <div>
                            <v-filter 
                                @filter-job="filterJob"
                                @sort-by-date="sortByDate"
                            ></v-filter>
                        </div>
                        <v-table :fieldNames="['Fit', 'Plot', 'Filename', 'Group']">
                            <template>
                                <tr v-for="f in fetchFiles('1D', sortBy, filterBy)" :class="isPlotted(f.filename)">
                                    <template>
                                        <td><input type="checkbox" :value="f.filename" v-model="fileFitChoice" :disabled=" (isPlotted(f.filename) == 'success' ? false : true)"
                            @change="setFileToFit"></td>
                                        <td><input :id="f.filename + '-Fetch1D'" type="checkbox" :value="f.filename" v-model="filesToPlot"></td>
                                        <td>{{f.filename}}</td>
                                        <td>{{f.jobTitle}}</td>
                                    </template>
                                </tr>
                            </template>
                        </v-table>
                    </div>
                </v-panel>

            <!-- Uploaded Data Panel  -->
                <v-panel PANELTITLE="Uploaded Data" PANELTYPE="success">
                    <div v-show="uploadFiles.length > 0">
                     <v-table :fieldNames="['Fit', 'Plot', 'Filename', 'Delete']">
                            <template>
                                <tr v-for="f in uploadFiles" :class="isPlotted(f.filename)">
                                    <template>
                                        <td><input type="checkbox" :value="f.filename" v-model="fileFitChoice" :disabled="(isPlotted(f.filename) == 'success' ? false : true)"
                            @change="setFileToFit"></td>
                                        <td><input :id="f.filename + '-Upload1D'" type="checkbox" :value="f.filename" v-model="filesToPlot"></td>
                                        <td>{{f.filename}}</td>
                                        <td><button class="btn btn-danger btn-xs" @click="removeFile(f.filename)"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
                                    </template>
                                </tr>
                            </template>
                        </v-table>
                    </div>
                </v-panel>

                <div id="btn-selections" v-if="isFiles" class="row">
                    <div class="col-md-6"><button class="btn btn-default btn-select-all" @click="checkAll"><i class="fa fa-plus-circle" aria-hidden="true"></i> Select All</button></div>
                    <div class="col-md-6"><button class="btn btn-default btn-unselect-all" @click="clearSelected" :disabled="disable"><i class="fa fa-minus-circle" aria-hidden="true"></i> Unselect All</button></div>
                </div>
            </v-panel-group>

        <!-- Controls Main Panel  -->
        <v-panel-group MAINTITLE="Controls" PANELTYPE="primary">
            <!-- Scales Panel  -->
            <v-panel PANELTITLE="Scales" PANELTYPE="success" :COLLAPSE="false">

                <v-scales 
                    :DISABLE="disable"
                    @update-scales="setScales"
                    @reset-scales="resetScales"
                    ref="scales">
                </v-scales>

            </v-panel>
            
            <!-- Transformation Panel  -->
            <v-panel PANELTITLE="Transformations" PANELTYPE="success" :COLLAPSE="true">
                <v-transformation
                    :XTRANS="$data.currentConfiguration.xTransformation"
                    :YTRANS="$data.currentConfiguration.yTransformation"
                    @set-transformations="setTransformations"
                    @reset-transformations="resetTransformations"
                    :DISABLE="disable"
                ></v-transformation>
            </v-panel>

            <!-- Fit Configuration Panel  -->
            <v-panel PANELTITLE="Fit Configurations" PANELTYPE="success" :COLLAPSE="true">
                <v-fit-config
                    :DISABLE="this.fileToFit === null"
                    :EQUATION="$data.currentConfiguration.equation"
                    @set-fit="setFit"
                    @set-fit-setting="setFitSettings"
                    @set-equation="setEquation"
                    @reset-file-fit-choice="resetFileFitChoice"
                    ref="fit_configurations"
                ></v-fit-config>
            </v-panel>

            <!-- Fit Settings Panel  -->
            <v-panel PANELTITLE="Levenberg–Marquardt Parameters" PANELTYPE="info" :COLLAPSE="true">
                <v-levenberg
                    :DISABLE="this.fileToFit === null"
                    @set-fit-settings="setFitSettings"
                    ref="fit_settings"
                ></v-levenberg>
            </v-panel>


        </v-panel-group>
      </div>
    
        <v-plot-1D
            :DISABLE="disable"
            :SHOWTABLE="fileToFit !== null"
        ></v-plot-1D>
      <!-- <div class="col-lg-10">
        <v-panel PANELTITLE="1D Plot" PANELTYPE="primary">
            <div id="plot-1D"></div>
        </v-panel>
      </div> -->
</div>
  </div>
</template>

<script>
/* Import Packages */
import * as d3 from 'd3';
import _ from 'lodash';

/* Import Components */
import Panel from '../BaseComponents/Panels/Panel.vue';
import PanelGroup from '../BaseComponents/Panels/PanelGroup.vue';
import Table from '../BaseComponents/Table.vue';
import Filter from '../BaseComponents/TableFilter.vue';
import Scales from '../BaseComponents/Scales.vue';
import Levenberg from '../BaseComponents/Levenberg.vue';
import FitConfiguration from '../BaseComponents/FitConfiguration.vue';
import Transformation from '../BaseComponents/Transformation.vue';
import Plot1D from './Plot_1D.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

/* Import Mixins */
import { parse1D, pull1DData } from '../../assets/javascript/mixins/readData.js';
import { fetchFiles } from '../../assets/javascript/mixins/fetchFiles.js';

import fd from '../../assets/javascript/fitData.js';

export default {
    name: 'New1D',
    components: {
      'v-panel-group': PanelGroup,
      'v-panel': Panel,
      'v-table': Table,
      'v-filter': Filter,
      'v-scales': Scales,
      'v-levenberg': Levenberg,
      'v-fit-config': FitConfiguration,
      'v-transformation': Transformation,
      'v-plot-1D': Plot1D
    },
    data: function () {
      return {
        selectedData: [],
        scales: {
          xScale: d3.scaleLinear(),
          xScaleType: 'X',
          yScale: d3.scaleLinear(),
          yScaleType: 'Y'
        },
        disable: true,
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
        filterBy: 'All',
        sortBy: 'ascending',
        filesToPlot: [],
        fileFitChoice: [],
        fileToFit: null,
        currentData: [],
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
    mixins: [parse1D, pull1DData, fetchFiles],
    computed: {
      uploadFiles() {
        //   console.log("Store 1D", this.$store.getters.getUploaded1D);
          return _.cloneDeep(this.$store.getters.getUploaded1D);
      },
      isFiles() {
          let fetchLength = this.$store.getters.getFetched1D.length;
          let uploadLength = this.$store.getters.getUploaded1D.length;
          
          return fetchLength > 0 || uploadLength > 0 ? true : false;
      }
    },
    methods: {
        clearSelected() {
            this.fileFitChoice = [];
            this.filesToPlot = [];
            this.fileToFit = null;
        },
        checkAll() {
            
            let fetched = this.$store.getters.getFetched1D;
            let uploaded = this.$store.getters.getUploaded1D;

            for(let i = 0, len = fetched.length; i < len; i++) {
                let fname = fetched[i].filename;

                if(this.filesToPlot.indexOf(fname) === -1) {
                    this.filesToPlot.push(fname);
                }
            }
            
            for(let i = 0, len = uploaded.length; i < len; i++) {
                let fname = uploaded[i].filename;

                if(this.filesToPlot.indexOf(fname) === -1) {
                    this.filesToPlot.push(fname);
                }
            }
        },
        removeFile(filename) {

            let index = this.filesToPlot.indexOf(filename);
            if(this.filesToPlot.indexOf(filename) > -1) {
                
                if(this.fileToFit === filename) {
                    this.fileToFit = null;
                }

                this.filesToPlot.splice(index,1);
            }

            this.$store.commit('remove1DFile', filename);
            this.$store.commit('removeColor', filename);
        },
        filterJob(filter) {
            this.filterBy = filter;
        },
        sortByDate(direction) {
            this.sortBy = direction;
        },
        isPlotted(filename) {
            //Dynamically style the file lists blue for plotted data
            if(this.filesToPlot.indexOf(filename) > -1) {
                return "success";
            } else {
                return "default";
            }
        },
        setFileToFit() {
            if(this.fileFitChoice.length > 0) this.fileFitChoice = this.fileFitChoice.slice(-1);
            this.fileToFit = this.fileFitChoice[0] ? this.fileFitChoice[0] : null;
        },
        getURLs(files) {

            var tempURLs = [], fetchList = [], uploadList = [];

            for(let i = 0, len = files.length; i < len; i++) {
                var inFetch = document.getElementById(files[i] + "-Fetch1D");

                if(inFetch) {
                    // console.log("In fetch:", inFetch);
                    fetchList.push(files[i]);
                } else {
                    // console.log("No in fetch:", inFetch);
                    uploadList.push(files[i]);
                }
            }

            // console.log("Here is the FetchList", fetchList);
            if(fetchList.length > 0)
                tempURLs.push(this.$store.getters.get1DURL('fetch', fetchList))

            // console.log("Here is the UploadList", uploadList);
            if(uploadList.length > 0)
                tempURLs.push(this.$store.getters.get1DURL('upload', uploadList))
            
            // Flatten out array so it isn't nested
            tempURLs = _.flatten(tempURLs);

            // console.log("Here are the tempURLs", tempURLs);
            return tempURLs;
        },
        resetFileFitChoice() {
            this.fileFitChoice = [];
            this.fileToFit = null;
        },
        uncheckFile(filename) {
            if(this.filesToPlot.indexOf(filename) > -1) {
                this.filesToPlot.splice(this.filesToPlot.indexOf(filename),1);
            }
        },
        deleteAllUploaded() {
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
        deleteFile(filename) {
            // Remove file from stored list
            delete this.storedData[filename];

            // Remove filename from uploads list
            eventBus.$emit('delete-file', filename);
        },
        setCurrentData(chosenData, checkList) {

            // console.log("setting current data:", chosenData, checkList);
            // console.log("selected data should be empty:", this.selectedData);
            
            var vm = this;
            if (checkList.length == 0) {
                // If no data is selected to be plotted, then
                // remove any elements previously plotted
                // and reset to default values
                console.log("Removing plot elements...");
                d3.select(".chart-1D").remove();
                d3.select(".tooltip-1D").remove();

                eventBus.$emit('reset-scales');
                // eventBus.$emit('reset-fit');
                this.resetFileFitChoice();

                this.disableButtons(false);
                this.selectedData = [];
                this.fileToFit = null;
            } else {
                var toFilter = [];
                
                // Remove any instances where checked file isn't in selected
                this.selectedData = this.selectedData.filter(function(item) { 
                    var match = checkList.indexOf(item.filename);
                    if(match > -1) {
                        toFilter.push(checkList[match]);
                    }

                    return checkList.indexOf(item.filename) > -1;
                });

                // console.log("Selected Data after removing unnecessary", this.selectedData);

                // Filter out data that doesn't need to be added
                var addList = checkList.filter(el => toFilter.indexOf(el) < 0).map(function(fname) {
                    let temp = chosenData.find(el => el.filename === fname);
                    return {filename: fname, data: temp};
                });

                for(let i = 0, len = addList.length; i < len; i++) {
                    let temp = addList[i].data;
                    if(this.currentConfiguration.xTransformation !== 'x' || this.currentConfiguration.yTransformation !== 'y') {
                        temp.dataTransformed = fd.transformData(temp, this.currentConfiguration);
                        // console.log("Temp data:", temp);
                        this.selectedData.push(temp);
                    } else {
                        temp.dataTransformed = _.cloneDeep(temp.data);
                        this.selectedData.push(temp);
                    }
                }
            }
        },
        setFitFile(filename) {
             this.fileToFit = filename;
        },
        setScales(type, value) {

            if(type === 'X') {
                this.scales.xScaleType = value;
                this.scales.xScale = this.$store.getters.getXScaleByID(value);
            } else {
                this.scales.yScaleType = value;
                this.scales.yScale = this.$store.getters.getYScaleByID(value);
            }
        },
        resetScales() {
            
            // Reset the selected options to default scales
            this.$refs.scales.$refs.y_select.value = 'Y';
            this.$refs.scales.$refs.x_select.value = 'X';

            this.scales.xScaleType = 'X';
            this.scales.xScale = this.$store.getters.getXScaleByID('X');
            this.scales.yScaleType = 'Y';
            this.scales.yScale = this.$store.getters.getYScaleByID('Y');
        },
        setFit(fitname) {
            // console.log("Setting new fit configuration:", fitname);
            // Deep clone because if you change the equation later, the original fit config's equation would be altered as well
            this.currentConfiguration = _.cloneDeep(this.$store.getters.getFitConfigsByID(fitname));
        },
        prepData(sd) {
            // This function is to prepare the data before calling 'plotCurrentData' function
            // The initial array has multiple arrays with objects inside,
            // The for loop strips out the object for just the arrays of data
            // Then D3.merge will do that, merge the arrays of data to one large array of data
            // This is simply to ease the process of plotting (see the nested loop function in 'plotCurrentData.js')
            let temp = [];
            // console.log("Data to push to temp:", sd);
            for (let i = 0; i < sd.length; i++) {
            // If a fit is set push transformed data, else push normal data
                temp.push(sd[i].dataTransformed);
            }
            // console.log("Merging data:", _.flatten(temp));
            return _.flatten(temp);
        },
        setParameters() {
            // Next tick is used to wait for all parameter changes to be updated
            // This is a to prevent the 'De-selecting' of all plotted data at once.
            this.$nextTick(function() {
                if(this.selectedData.length > 0) {
                    // console.log("Setting parameters", this.selectedData);
                    eventBus.$emit("set-parameters", {
                        data: this.prepData(this.selectedData),
                        colorDomain: this.$store.getters.getColorDomain,
                        scales: this.scales,
                        fileToFit: this.fileToFit,
                        fitConfiguration: this.currentConfiguration,
                        fitSettings: this.fitSettings
                    });
                } else {
                    // Remove any elements previously plotted
                    d3.select(".chart-1D").remove();
                    d3.select(".tooltip-1D").remove();
                }
            })
        },
        setEquation(eq) {
            this.currentConfiguration.equation = eq;
        },
        setTransformations(x,y) {
            // console.log("Setting transformations:", x, y);
            this.currentConfiguration.xTransformation = x;
            this.currentConfiguration.yTransformation = y;
        },
        setFitSettings(options) {
            this.fitSettings = options;
        },
        resetTransformations() {
            let xt = this.$store.getters.getFitConfigsXTrans(this.currentConfiguration.fit);
            let yt = this.$store.getters.getFitConfigsYTrans(this.currentConfiguration.fit);

            this.currentConfiguration.xTransformation = xt;
            this.currentConfiguration.yTransformation = yt;
        }
    },
    watch: {
        scales: {
            handler: function() {
                // console.log("Scales changed:", this.scales);
                this.setParameters();
            },
            deep: true
        },
        fileToFit: function () {
            // Watch if fileToFit changes, if so assign/re-assign selectedData.dataFitted       	
            // If fileToFit is set to Null, don't transform anything and reset the fit to none
            console.log("File is being fit:", this.fileToFit);
            if(this.fileToFit === null) {
                eventBus.$emit("set-fit-back");
                //eventBus.$emit("set-fit-settings-back");
                this.setFitSettings(this.$store.getters.getFitSettings);
                this.setFit("Linear");
            } else {
                this.selectedData.forEach( el => {
                    el.dataTransformed = fd.transformData(el.data, this.currentConfiguration);
                });
            }
        },
        selectedData: {
            handler: function() {
                this.setParameters();
            },
            deep: true
        },
        currentConfiguration: {
            handler: function() {
                // console.log("Current configurations changed!");
                if(this.currentConfiguration.xTransformation !== 'x' || this.currentConfiguration.yTransformation !== 'y') {
                    this.selectedData.forEach( el => {
                        el.dataTransformed = fd.transformData(el.data, this.currentConfiguration);
                    });
                } else {
                    this.selectedData.forEach( el => {
                        el.dataTransformed = _.cloneDeep(el.data);
                    });
                }
            },
            deep: true
        },
        uploadedFiles: function () {
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
        },
        filesToPlot: {
            // Watch if a file is selected, if so enable buttons and append selected data to a list
            handler: function () {
                var vm = this;

                // If a file is unselected while it has a fit, unselect the fit
                if(this.filesToPlot.indexOf(this.fileToFit) === -1) {
                    this.fileToFit = null;
                    this.fileFitChoice = [];
                }
                
                if(this.filesToPlot.length === 0) {
                    // There should be nothing to plot or fit,
                    // so reset everything to defaults.
                    // Remove any elements previously plotted
                    d3.select(".chart-1D").remove();
                    d3.select(".tooltip-1D").remove();

                    // Reset disable to default 'true'
                    this.disable = true;
                    
                    // Reset X & Y Scales back to default
                    this.resetScales();

                    // Reset X & Y Transformations back to default
                    this.resetTransformations();

                    // Reset Levenberg Settings to default
                    this.$refs.fit_settings.resetSettings();
                    
                    // Reset coefficients to an empty object
                    this.$refs.fit_configurations.$data.coefficients = {};
                    
                    // Reset selected data to an empty array
                    this.selectedData = [];

                    // Reset brush selection
                    eventBus.$emit("reset-brush-selection");
                    
                    console.log("No files to plot");

                } else {
                    this.disable = false;
                    var filesToFetch = [];

                    // First check if files to plot are in stored data
                    var tempData = this.filesToPlot.map(function(filename) {
                        var temp = vm.$store.getters.getSaved1D(filename);
                    
                        // console.log("Here is the temp:", temp);
                        if(temp === '999') {
                            // console.log("Not in stored:", filename);
                            filesToFetch.push(filename);
                        } else {
                            return temp;
                        }

                    }).filter(item => item !== undefined);
                    
                    // Next fetch the file URLs
                    var fileURLs = this.getURLs(filesToFetch);

                    // console.log("Got dem fileURLs", fileURLs);
                    if(fileURLs.length > 0) {
                        this.pull1DData(fileURLs, tempData);
                    } else {
                        this.setCurrentData(tempData, this.filesToPlot);
                    }
                }
            },
            deep: true
        }
    }
  }
</script>

<style scoped>
#New1D {
  position: absolute;
  left: 0;
  right: 0;
}

.btn-select-all, .btn-unselect-all {
  width: 100%;
  margin-top: 10px;
  white-space: normal;
}
</style>
