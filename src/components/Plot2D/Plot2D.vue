<template>
  <div id="Plot2D" class="col-md-12">
      <div class="container-fluid">
      <div class="col-md-2">
        <!-- Files Panel  -->
        <v-panel-group MAINTITLE="Files" PANELTYPE="primary">
                <v-panel PANELTITLE="Fetched" PANELTYPE="success" v-if="!isOffline">
                    <div v-show="fetchFiles.length > 0">
                        <div>
                            <v-filter 
                                group-type="SANS2D"
                                @filter-job="filterJob"
                                @sort-by-date="sortByDate"
                            ></v-filter>
                        </div>
                        <v-table :fieldNames="['Plot', 'Filename', 'Group']">
                            <template>
                                <tr v-for="f in fetchFiles('SANS2D', sortBy, filterBy)" :class="isPlotted(f.filename)">
                                    <template>
                                        <td class="td-check"><input type="checkbox" :value="f.filename" v-model="filesToPlot" @change="setFileToPlot"></td>
                                        <td class="td-name">{{f.filename}}</td>
                                        <td class="td-name">{{f.jobTitle}}</td>
                                    </template>
                                </tr>
                            </template>
                        </v-table>
                    </div>
                </v-panel>

                <v-panel PANELTITLE="Uploaded" PANELTYPE="success">
                    <div v-show="getUploaded.length > 0">
                     <v-table :fieldNames="['Plot', 'Filename', 'Delete']">
                            <template>
                                <tr v-for="f in getUploaded" :class="isPlotted(f.filename)">
                                    <template>
                                        <td class="td-check"><input type="checkbox" :value="f.filename" v-model="filesToPlot" @change="setFileToPlot"></td>
                                        <td class="td-name">{{f.filename}}</td>
                                        <td class="td-name"><button class="btn btn-danger btn-xs" @click="removeFile(f.filename)"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
                                    </template>
                                </tr>
                            </template>
                        </v-table>
                    </div>
                </v-panel>
            </v-panel-group>

        <!-- Controls Panel  -->
        <v-panel-group MAINTITLE="Controls" PANELTYPE="primary">

            <v-panel PANELTITLE="Hexbin Settings" PANELTYPE="success">
                <fieldset :disabled="currentData.length === 0">
                    <label>Bin Size: <span class="damping-output">{{ tempBinSize }}</span></label>

                    <input type="range" min="5" max="25" step="1" 
                        v-model.number="tempBinSize" 
                        @mouseup="setHexSettings"
                        @keyup="setHexSettings" 
                        @touchend="setHexSettings"> 

                    <br>

                    <!-- Intensity Transformation Selection -->
                    <div class="input-group">
                        <span class="input-group-addon">Intensity Scale</span>
                        <select class="form-control" v-model="tempTransform" @change="setHexSettings"> 
                            <option>Log</option>
                            <option>Linear</option>
                        </select>
                    </div>
                    
                    <button id="btn-reset-hex-settings" class="btn btn-warning btn-sm" @click="resetSettings"><i class="fa fa-refresh" aria-hidden="true"></i> Reset</button>
                </fieldset>
            </v-panel>

        </v-panel-group>
      </div>

      <div class="col-md-10" id="plot-2d-col">
        <v-panel PANELTITLE="SANS 2D Plot" PANELTYPE="primary">
            <!-- Plot reset button inserted into panel heading  -->
            <v-reset-button :onClick="resetPlot" v-if="currentData.length > 0" slot="header-content">Reset Plot</v-reset-button>
            
            <div :id="'plot-' + ID"></div>
        </v-panel>
      </div>
</div>
  </div>
</template>

<script>
/* Import Libraries */
import * as d3 from 'd3';
import _ from 'lodash';

/* Import Default Chart Elements */
import chartElements from '../../assets/javascript/mixins/chart/chartElements.js';

/* Import Components */
import Panel from '../BaseComponents/Panels/Panel.vue';
import PanelGroup from '../BaseComponents/Panels/PanelGroup.vue';
import Table from '../BaseComponents/Table.vue';
import Filter from '../BaseComponents/TableFilter.vue';
import ResetButton from '../BaseComponents/ResetButton.vue';

/* Import Local Mixins */
import { drawPlot } from './mixins/drawPlot.js';
import { updatePlot } from './mixins/updatePlot.js';
import { initDimensions } from './mixins/initDimensions.js';
import { initScales } from './mixins/initScales.js';
import { setElements } from './mixins/setElements.js';
import { zoomed } from './mixins/zoomed.js';
import { resetPlot } from './mixins/resetPlot.js';

/* Import Shared Mixins */
import { read2DData, get2DData } from '../../assets/javascript/mixins/readFiles/read2D.js';
import { fetchFiles } from '../../assets/javascript/mixins/fetchFiles.js';
import { filterJobs } from '../../assets/javascript/mixins/filterJobs.js';
import { isOffline } from '../../assets/javascript/mixins/isOffline.js';
import { isPlotted } from '../../assets/javascript/mixins/isPlotted.js';
import { setResponsive } from '../../assets/javascript/mixins/chart/setResponsive.js';
import { addLabels } from '../../assets/javascript/mixins/chart/addLabels.js';

export default {
    name: 'Plot2D',
    components: {
      'v-panel-group': PanelGroup,
      'v-panel': Panel,
      'v-table': Table,
      'v-filter': Filter,
      'v-reset-button': ResetButton
    },
    data() {

        let tempData = _.cloneDeep(chartElements);

        tempData.filesToPlot = [];
        tempData.fileToPlot = null;
        tempData.filterBy = 'All';
        tempData.sortBy = 'ascending';
        tempData.tempBinSize = 15;
        tempData.tempTransform = 'Log';
        tempData.hexSettings = {
            intensityTransformation: 'Log',
            binSize: 15
        };

        tempData.labels.x = 'Qx';
        tempData.labels.y = 'Qy';

        tempData.currentData = [];

        tempData.scale.l = undefined;

        tempData.dimensions.lw = undefined;
        tempData.dimensions.lh = undefined;

        tempData.binSize = undefined;
        tempData.plotData = [];
        tempData.ID = 'SANS2D';
        tempData.isMathJax = true;

        return tempData;
    },
    computed: {
      getUploaded() {
          return _.cloneDeep(this.$store.getters.getUploaded('SANS2D'));
      }
    },
    mixins: [
        read2DData, 
        get2DData, 
        fetchFiles, 
        filterJobs, 
        isOffline,
        drawPlot,
        updatePlot,
        initDimensions,
        initScales,
        setElements,
        zoomed,
        setResponsive,
        resetPlot,
        isPlotted,
        addLabels,
    ],
    methods: {
        resetSettings() {
            this.tempBinSize = 15;
            this.tempTransform = 'Log';

            this.hexSettings = {
                intensityTransformation: 'Log',
                binSize: 15
            };
        },
        setHexSettings() {
            this.hexSettings = {
                intensityTransformation: this.tempTransform,
                binSize: this.tempBinSize
            }
        },
        setFileToPlot() {
            if (this.filesToPlot.length > 0) this.filesToPlot = this.filesToPlot.slice(-1);
            
            this.fileToPlot = this.filesToPlot[0] ? this.filesToPlot[0] : null;
        },
        removeFile(filename) {
            let vm = this;

            // If file is in fileToPlot or filesToPlot, remove it
            // and remove plot elements
            if (this.fileToPlot === filename) {
                this.fileToPlot = null;
                this.filesToPlot = [];
            }

            d3.select(".chart-" + vm.ID).remove();
            d3.select(".tooltip-" + vm.ID).remove();

            this.$store.commit('removeFile', { filename: filename, dataType: 'SANS2D'});
        }
    },
    watch: {
        hexSettings: {
            handler() {
                this.drawPlot(this.currentData, this.hexSettings);
            },
            deep: true
        },
        fileToPlot() {
            let vm = this;

            // Check if file is in the stored 2d list
            // a value of '999' means no data is stored
            if (this.fileToPlot !== null) {
                var data2D = this.$store.getters.getSavedFile('SANS2D', this.fileToPlot);

                // If not, Check if the file is in the Fetched list or Uploaded
                if (data2D === '999') {
                    var inUpload2D = this.$store.getters.inUploadedSANS2D(this.fileToPlot);

                    if (inUpload2D) {
                        // It's an uploaded file so read the data from blob
                        this.read2DData(inUpload2D)

                    } else {
                        // It's a fetched file so get file then get the data url
                        var file = this.$store.getters.getSANS2DFile(this.fileToPlot);
                        this.get2DData(file);
                    }
                } else {
                    // File is in saved, so let's plot it
                    this.currentData = data2D;
                    this.drawPlot(data2D, this.hexSettings);
                }
            } else {
                
                this.currentData = [];
                // Remove any current 2D plots
                d3.select(".chart-" + vm.ID).remove();
                d3.select(".tooltip-" + vm.ID).remove();
            }
        }
    }
  }
</script>

<style scoped>
@import './style/plot-2D-styles.css';

#Plot2D {
  position: absolute;
  left: 0;
  right: 0;
  padding: 0px;  
}

/* Styles for control panel elements  */
#btn-reset-hex-settings {
  width: 100%;
}
</style>
