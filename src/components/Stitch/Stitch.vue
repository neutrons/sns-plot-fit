<template>
  <div id="Stitch" class="col-md-12">
    <div class="container-fluid">
        <!-- Left Sidebar for Controls and File List  -->
        <div class="col-md-2">
            <v-panel-group MAINTITLE="Files" PANELTYPE="primary">
                <v-panel PANELTITLE="Fetched Data" PANELTYPE="success" v-if="!isOffline">
                    <div v-show="fetchFiles.length > 0">
                        <div>
                            <v-filter 
                                @filter-job="filterJob"
                                @sort-by-date="sortByDate"
                            ></v-filter>
                        </div>
                        <v-table :fieldNames="['Plot', 'Filename', 'Group']">
                            <template>
                                <tr v-for="f in fetchFiles('1D', sortBy, filterBy)" :class="isPlotted(f.filename)">
                                    <template>
                                        <td class="td-check"><input :id="f.filename + '-FetchStitch'" type="checkbox" :value="f.filename" v-model="filesToPlot"></td>
                                        <td class="td-name">{{f.filename}}</td>
                                        <td class="td-name">{{f.jobTitle}}</td>
                                    </template>
                                </tr>
                            </template>
                        </v-table>
                    </div>
                </v-panel>

                <v-panel PANELTITLE="Uploaded Data" PANELTYPE="success">
                    <div v-show="uploaded1DFiles.length > 0">
                     <v-table :fieldNames="['Plot', 'Filename', 'Delete']">
                            <template>
                                <tr v-for="f in uploaded1DFiles" :class="isPlotted(f.filename)">
                                    <template>
                                        <td class="td-check"><input type="checkbox" :value="f.filename" v-model="filesToPlot"></td>
                                        <td class="td-name">{{f.filename}}</td>
                                        <td class="td-name"><button class="btn btn-danger btn-xs" @click="remove1DFile(f.filename)"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
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
                        <span slot="right-label"><i class="fa fa-square-o"></i> Select</span>
                    </v-switch> 
                    <button id="remove-brushes-btn" class="btn btn-danger btn-xs btn-block" :disabled="!isMultipleLines" @click="removeBrushes"><i class="fa fa-times-circle" aria-hidden="true"></i> Remove Selections</button>
                    <br>
                    <button id="stitch-btn" class="btn btn-success btn-xs btn-block" :disabled="!isMultipleLines" @click="stitchData"><i class="fa fa-line-chart" aria-hidden="true"></i> Stitch</button>
                    <br>
                    <button id="remove-brushes-btn" class="btn btn-danger btn-xs btn-block" @click="removeStitch" :disabled="!isStitched"><i class="fa fa-times-circle" aria-hidden="true"></i> Remove Stitch</button>
                    <br>
                    <button id="save-stitch-btn" class="btn btn-primary btn-xs btn-block" :disabled="!isStitched" @click="saveStitchLine"><i class="fa fa-floppy-o" aria-hidden="true"></i> Save Stitch</button>
                    <br>
                    <button id="draw-brushes-btn" class="btn btn-primary btn-xs btn-block" v-if="isBrushesStored" @click="drawBrushes" :disabled="!isMultipleLines"><i class="fa fa-undo" aria-hidden="true"></i> Restore Brushes</button>
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
import PlotStitch from './stitchPlot.vue';
import ToggleSwitch from '../BaseComponents/ToggleSwitch.vue';

/* Import Mixins */
import { setScales } from '../../assets/javascript/mixins/setScales.js';
import { fetchFiles } from '../../assets/javascript/mixins/fetchFiles.js';
import { parse1D, pull1DData } from '../../assets/javascript/mixins/readData.js';
import { remove1DFile } from '../../assets/javascript/mixins/remove1DFile.js';
import { uploaded1DFiles } from '../../assets/javascript/mixins/uploaded1DFiles.js';
import { prepPlotData } from '../../assets/javascript/mixins/prepPlotData.js';
import { filterJobs } from '../../assets/javascript/mixins/filterJobs.js';
import { getURLs } from '../../assets/javascript/mixins/getURLs.js';
import { isOffline } from '../../assets/javascript/mixins/isOffline.js';
import { isPlotted } from '../../assets/javascript/mixins/isPlotted.js';

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
    mixins: [fetchFiles, parse1D, pull1DData, setScales, filterJobs, getURLs, isOffline, isPlotted, remove1DFile, uploaded1DFiles, prepPlotData],
    computed: {
      xScales() {
        return this.$store.getters.getXScales;
      },
      yScales() {
        return this.$store.getters.getYScales;
      }
    },
    methods: {
        setCurrentData(chosenData, checkList) {
            
            var vm = this;
            chosenData = _.cloneDeep(chosenData);
            
            if (checkList.length == 0) {
                // If no data is selected to be plotted, then
                // remove any elements previously plotted
                // and reset to default values
                console.log("Removing plot elements...");
                d3.select(".chart-stitch").remove();
                d3.select("#tooltip-stitch").remove();

                this.selectedData = [];
            } else {

                this.selectedData = _.cloneDeep(chosenData);

            }
        },
        prepData(sd) {

            return this.prepPlotData(sd, function() {
                    let temp = [];

                    for (let i = 0; i < sd.length; i++) temp.push(sd[i].data);

                    return temp;
                });
        },
        setParameters() {
            this.$nextTick(function() {
                if(this.selectedData.length > 0) {
                    this.$refs.stitchPlot.setParameters({
                        data: this.prepData(this.selectedData),
                        scales: this.scales,
                        colorDomain: this.$store.getters.getColorDomain,
                        brushCount: this.filesToPlot.length,
                        labels: {x: 'q', y: 'I(q)'}
                    });

                } else {
                    // console.log("No data to plot...");
                    d3.select(".chart-stitch").remove();
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

            d3.select(".chart-stitch").remove();
            d3.select("#tooltip-stitch").remove();

        },
        drawBrushes() {
            this.$refs.stitchPlot.drawSavedBrushes();
        }
    },
    watch: {
        scales: {
            handler() {
                this.$nextTick(function() {
                    if (this.selectedData.length > 0) {
                        this.$refs.stitchPlot.updateScales(this.scales);
                    }
                });
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
                    d3.select(".chart-stitch").remove();
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

<style lang="less" scoped>
#Stitch {
  position: absolute;
  left: 0;
  right: 0;
  padding: 0px;  
}

#save-error-msg {
    display: none;
}
</style>
