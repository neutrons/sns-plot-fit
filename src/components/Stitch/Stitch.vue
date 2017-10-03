<template>
  <div id="Stitch" class="col-lg-12">
    <div class="container-fluid">
        <!-- Left Sidebar for Controls and File List  -->
        <div class="col-lg-2">
            <v-panel-group MAINTITLE="Files" PANELTYPE="primary">
                <v-panel PANELTITLE="Fetched Data" PANELTYPE="success">
                    <div v-show="fetchFiles.length > 0">
                        <div>
                            <v-filter 
                                @filter-job="filterJob"
                                @sort-by-date="sortByDate"
                            ></v-filter>
                        </div>
                        <v-table :fieldNames="['Plot', 'Filename', 'Group']">
                            <template>
                                <tr v-for="f in fetchFiles('1D', sortBy, filterBy)">
                                    <template>
                                        <td><input :id="f.filename + '-FetchStitch'" type="checkbox" :value="f.filename" v-model="filesToPlot"></td>
                                        <td>{{f.filename}}</td>
                                        <td>{{f.jobTitle}}</td>
                                    </template>
                                </tr>
                            </template>
                        </v-table>
                    </div>
                </v-panel>

                <v-panel PANELTITLE="Uploaded Data" PANELTYPE="success">
                    <div v-show="uploadFiles.length > 0">
                     <v-table :fieldNames="['Plot', 'Filename', 'Delete']">
                            <template>
                                <tr v-for="f in uploadFiles">
                                    <template>
                                        <td><input type="checkbox" :value="f.filename" v-model="filesToPlot"></td>
                                        <td>{{f.filename}}</td>
                                        <td><button class="btn btn-danger btn-xs" @click="removeFile(f.filename)"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
                                    </template>
                                </tr>
                            </template>
                        </v-table>
                    </div>
                </v-panel>
            </v-panel-group>

            <v-panel-group MAINTITLE="Controls" PANELTYPE="primary">

                <v-panel PANELTITLE="Scales" PANELTYPE="success">
                    <!-- Add Items to a single panel  -->
                    <v-scales 
                        :DISABLE="disable"
                        @update-scales="setScales"
                        @reset-scales="resetScales"
                        ref="scales"
                        >
                    </v-scales>
                </v-panel>

                <v-panel PANELTITLE="Edit Tools" PANELTYPE="info">
                     <v-switch leftID="zoom" rightID="brush" :DISABLE="disable" ref="toggle"
                     @switchChange="toggleEdit"
                     >
                        <span slot="left-label"><i class="fa fa-search-plus"></i> Zoom</span>
                        <span slot="right-label"><i class="fa fa-square-o"></i> Brush</span>
                    </v-switch> 
                    <button id="remove-brushes-btn" class="btn btn-danger btn-sm btn-block" v-if="isMultipleLines" @click="removeBrushes"><i class="fa fa-times-circle" aria-hidden="true"></i> Remove Brushes</button>
                    <br>
                    <button id="stitch-btn" class="btn btn-success btn-sm btn-block" v-if="isMultipleLines" @click="stitchData"><i class="fa fa-line-chart" aria-hidden="true"></i> Stitch</button>
                    <br>
                    <button id="remove-brushes-btn" class="btn btn-danger btn-sm btn-block" @click="removeStitch" v-if="isStitched"><i class="fa fa-times-circle" aria-hidden="true"></i> Remove Stitch Line</button>
                    <br>
                    <button id="save-stitch-btn" class="btn btn-primary btn-sm btn-block" v-if="isStitched" @click="saveStitchLine"><i class="fa fa-floppy-o" aria-hidden="true"></i> Save Stitch Line</button>
                    <br>
                    <button id="draw-brushes-btn" class="btn btn-primary btn-sm btn-block" v-if="isBrushesStored" @click="drawBrushes" :disabled="!isMultipleLines"><i class="fa fa-undo" aria-hidden="true"></i> Restore Brushes</button>
                </v-panel>

            </v-panel-group>
        </div>

        <!-- Plot Panel for Main Chart  -->
        <v-stitch-plot 
            :DISABLE="disable"
            ref="stitchPlot">
        </v-stitch-plot>

        <!-- Modal for Saving a Line -->
        <div class="modal fade" id="saveModal" role="dialog">
            <div class="modal-dialog">
                <div class="modal-content">
                    <!-- <form id="role-form"> -->
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>

                            <h4 class="modal-title">Save Stitch Line</h4>
                        </div>
                        <div class="modal-body">

                            <div class="form-group col-md-12">
                                <div class="input-group">
                                    <span class="input-group-addon">File Name:</span>
                                    <input id="file-name-input" placeholder="your_file_name" class="form-control" required oninvalid="this.setCustomValidity('Please enter a file name.')"
                                        oninput="this.setCustomValidity('')" />
                                    <span class="input-group-addon">_Iq.txt</span>
                                </div>
                            </div>

                            <div class="clearfix"></div>
                            
                            <div id="save-error-msg" class="alert alert-danger">
                                <p><strong>Warning!</strong> Filename should contain no special characters such as * . ” / \ [ ] : ; | = , &lt; ? &gt; &amps; $ # ! ‘ { } ( )</p>
                                <p>Nor should a filename start with a number</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button id="cancel-save-btn" class="btn btn-default" data-dismiss="modal">Cancel</button>
                            <button id="save-btn" class="btn btn-success">Save</button>
                        </div>
                    <!-- </form> -->
                </div>
            </div>
        </div>

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
import Scales from '../BaseComponents/Scales.vue';
import Table from '../BaseComponents/Table.vue';
import TableFilter from '../BaseComponents/TableFilter.vue';
import PlotStitch from './PlotStitch.vue';
import ToggleSwitch from '../BaseComponents/ToggleSwitch.vue';

/* Import Mixins */
import { setScales } from '../../assets/javascript/mixins/setScales.js';
import { fetchFiles } from '../../assets/javascript/mixins/fetchFiles.js';
import { parse1D, pull1DData } from '../../assets/javascript/mixins/readData.js';
import { filterJobs } from '../../assets/javascript/mixins/filterJobs.js';
import { getURLs } from '../../assets/javascript/mixins/getURLs.js';

// The eventBus serves as the means to communicating between components.
import { eventBus } from '../../assets/javascript/eventBus';

export default {
    name: 'Stitch',
    components: {
      'v-panel-group': PanelGroup,
      'v-panel': Panel,
      'v-scales': Scales,
      'v-table': Table,
      'v-filter': TableFilter,
      'v-stitch-plot': PlotStitch,
      'v-switch': ToggleSwitch
    },
    data: function () {
      return {
          scales: {
              xScale: d3.scaleLinear(),
              xScaleType: 'X',
              yScale: d3.scaleLinear(),
              yScaleType: 'Y'
          },
          filterBy: 'All',
          sortBy: 'ascending',
          disable: true,
          filesToPlot: [],
          selectedData: [],
          isStitched: false,
          isMultipleLines: false,
          isBrushesStored: false
      }
    },
    mounted() {
        // Listen for event that stitch has been saved
        let vm = this;

        eventBus.$on('reset-stitch', this.resetStitch);
        eventBus.$on('reset-is-stitched', function() {
            vm.isStitched = false;
        })
    },
    mixins: [fetchFiles, parse1D, pull1DData, setScales, filterJobs, getURLs],
    computed: {
      xScales() {
        return this.$store.getters.getXScales;
      },
      yScales() {
        return this.$store.getters.getYScales;
      },
      uploadFiles() {
          return _.cloneDeep(this.$store.getters.getUploaded1D);
      }
    },
    methods: {
        removeFile(filename) {
  
            let index = this.filesToPlot.indexOf(filename);
            if(this.filesToPlot.indexOf(filename) > -1) {

                this.filesToPlot.splice(index,1);
            }

            this.$store.commit('remove1DFile', filename);
            this.$store.commit('removeColor', filename);
        },
        setCurrentData(chosenData, checkList) {
            
            var vm = this;
            if (checkList.length == 0) {
                // If no data is selected to be plotted, then
                // remove any elements previously plotted
                // and reset to default values
                console.log("Removing plot elements...");
                d3.select(".stitch-chart").remove();
                d3.select("#tooltip-stitch").remove();

                this.selectedData = [];
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

                // Filter out data that doesn't need to be added and keep the rest
                checkList.filter(el => toFilter.indexOf(el) < 0).map(function(fname) {

                    let temp = chosenData.find(el => el.filename === fname);
                    
                    vm.selectedData.push(temp);
                });

            }
        },
        prepData(sd) {
            let temp = [];
           
            for (let i = 0; i < sd.length; i++) {
                temp.push(sd[i].data);
            }
            
            // Flatten out any nested arrays
            return _.flatten(temp);
        },
        setParameters() {
            this.$nextTick(function() {
                if(this.selectedData.length > 0) {
                    this.$refs.stitchPlot.plot({
                        data: this.prepData(this.selectedData),
                        scales: this.scales,
                        colorDomain: this.$store.getters.getColorDomain,
                        brushCount: this.filesToPlot.length
                    })

                } else {
                    // console.log("No data to plot...");
                    d3.select(".stitch-chart").remove();
                    d3.select("#tooltip-stitch").remove();
                    this.$refs.stitchPlot.resetDefaults();
                    this.$refs.toggle.picked = true;
                    this.isStitched = false;
                }
            })
        },
        stitchData() {
            let result = this.$refs.stitchPlot.stitchData();

            this.isStitched = result;
        },
        removeBrushes() {
            this.$refs.stitchPlot.removeBrushes();
        },
        removeStitch() {
            let result = this.$refs.stitchPlot.removeStitchLine();

            this.isStitched = result;
        },
        toggleEdit(choice) {
            this.$refs.stitchPlot.toggleEdit(choice);
        },
        saveStitchLine() {
            this.$refs.stitchPlot.saveStitchLine();
        },
        resetStitch() {
            this.disable = true;
            this.isStitched = false;
            this.isMultipleLines = false;
            this.filesToPlot = [];
            this.selectedData = [];
            this.isBrushesStored = true;
            this.resetScales();

            d3.select(".stitch-chart").remove();
            d3.select("#tooltip-stitch").remove();

        },
        drawBrushes() {
            this.$refs.stitchPlot.drawSavedBrushes();
        }
    },
    watch: {
        scales: {
            handler() {
                this.$refs.stitchPlot.changeScales(this.scales);
            },
            deep: true
        },
        filesToPlot: {
            handler() {
                var vm = this;
                
                if(this.filesToPlot.length === 0) {
                    // There should be nothing to plot or fit,
                    // so reset everything to defaults.
                    // Remove any elements previously plotted
                    d3.select(".stitch-chart").remove();
                    d3.select("#tooltip-stitch").remove();

                    // Reset disable to default 'true'
                    this.disable = true;
                    
                    // Reset X & Y Scales back to default
                    this.resetScales();

                    this.isStitched = false;
                    this.isMultipleLines = false;
                    
                    // Reset selected data to an empty array
                    this.selectedData = [];
                    
                    // console.log("No files to plot");

                } else {
                    this.disable = false;
                    
                    // If one file is being plotted, hide any buttons related to stitch line
                    // Toggle back to zoom
                    if(this.filesToPlot.length < 2) {
                        this.isStitched = false;
                        this.isMultipleLines = false;
                        this.$refs.toggle.picked = true;
                        this.$refs.stitchPlot.resetToggle();
                    } else {
                        this.isMultipleLines = true;
                    }

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
                    var fileURLs = this.getURLs(filesToFetch, "-FetchStitch");

                    // console.log("Got dem fileURLs", fileURLs);
                    if(fileURLs.length > 0) {
                        this.pull1DData(fileURLs, tempData);
                    } else {
                        this.setCurrentData(tempData, this.filesToPlot);
                    }
                }
            },
            deep: true
        },
        selectedData: {
            handler() {
                this.setParameters();
            },
            deep: true
        }
    }
  }
</script>

<style scoped>
#Stitch {
  position: absolute;
  left: 0;
  right: 0;  
}

#save-error-msg {
    display: none;
}
</style>
