<template>
  <div id="Plot2D" class="col-md-12">
      <div class="container-fluid">
      <div class="col-md-2">
        <!-- Files Panel  -->
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
                                <tr v-for="f in fetchFiles('2D', sortBy, filterBy)" :class="isPlotted(f.filename)">
                                    <template>
                                        <td><input type="checkbox" :value="f.filename" v-model="filePlotChoices" @change="setFileToPlot"></td>
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
                                <tr v-for="f in uploadFiles" :class="isPlotted(f.filename)">
                                    <template>
                                        <td><input type="checkbox" :value="f.filename" v-model="filePlotChoices" @change="setFileToPlot"></td>
                                        <td>{{f.filename}}</td>
                                        <td><button class="btn btn-danger btn-xs" @click="removeFile(f.filename)"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
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

                    <br>
                    
                    <button id="btn-reset-hex-settings" class="btn btn-warning btn-sm" @click="resetSettings"><i class="fa fa-refresh" aria-hidden="true"></i> Reset</button>
                </fieldset>
            </v-panel>

        </v-panel-group>
      </div>

      <div class="col-md-10">
        <v-panel PANELTITLE="2D Plot" PANELTYPE="primary">
            <!-- Plot reset button inserted into panel heading  -->
            <v-reset-button :onClick="resetPlot" v-if="currentData.length > 0" slot="header-content">Reset Plot</v-reset-button>
            
            <div id="plot-2D"></div>
        </v-panel>
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
import Table from '../BaseComponents/Table.vue';
import Filter from '../BaseComponents/TableFilter.vue';
import ResetButton from '../BaseComponents/ResetButton.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

/* Import Mixins */
import { parse2D, read2DData, get2DData } from '../../assets/javascript/mixins/readData.js';
import { fetchFiles } from '../../assets/javascript/mixins/fetchFiles.js';
import { filterJobs } from '../../assets/javascript/mixins/filterJobs.js';

/* Import Plot Function */
import { hexPlot } from './hexPlot.js';

export default {
    name: 'Plot2D',
    mixins: [parse2D, read2DData, get2DData, hexPlot, fetchFiles, filterJobs],
    components: {
      'v-panel-group': PanelGroup,
      'v-panel': Panel,
      'v-table': Table,
      'v-filter': Filter,
      'v-reset-button': ResetButton
    },
    data: function () {
        return {
            filePlotChoices: [],
            fileToPlot: null,
            filterBy: 'All',
            sortBy: 'ascending',
            tempBinSize: 15,
            tempTransform: 'Log',
            hexSettings: {
                intensityTransformation: 'Log',
                binSize: 15
            },
            currentData: []
        }
    },
    computed: {
      uploadFiles() {
          return _.cloneDeep(this.$store.getters.getUploaded2D);
      }
    },
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
        isPlotted(filename) {
            //Dynamically style the file lists blue for plotted data
            if(this.fileToPlot === filename){
                return "success";
            } else {
                return "default";
            }
        },
        setFileToPlot() {
            if(this.filePlotChoices.length > 0) this.filePlotChoices = this.filePlotChoices.slice(-1);
            
            this.fileToPlot = this.filePlotChoices[0] ? this.filePlotChoices[0] : null;
        },
        removeFile(filename) {
            // If file is in fileToPlot or filePlotChoices, remove it
            // and remove plot elements
            if(this.fileToPlot === filename) {
                this.fileToPlot = null;
                this.filePlotChoices = [];
            }
            d3.select(".chart-2D").remove();
            d3.select(".tooltip-2D").remove();

            this.$store.commit('remove2DFile', filename);
        },
        resetPlot() {
            this.hexPlot(this.currentData, this.hexSettings);
        }
    },
    watch: {
        hexSettings: {
            handler: function() {
                // console.log("Hex settings changed:", this.hexSettings);
                this.hexPlot(this.currentData, this.hexSettings);
            },
            deep: true
        },
        fileToPlot: function() {
            // Check if file is in the stored 2d list
            // a value of '999' means no data is stored
            if(this.fileToPlot !== null) {
                var data2D = this.$store.getters.getSaved2D(this.fileToPlot);

                // If not, Check if the file is in the Fetched list or Uploaded
                if(data2D === '999') {
                    var inUpload2D = this.$store.getters.inUploaded2D(this.fileToPlot);

                    if(inUpload2D) {
                        // It's an uploaded file so read the data from blob
                        this.read2DData(inUpload2D)

                    } else {
                        // It's a fetched file so get file then get the data url
                        var file = this.$store.getters.get2DFile(this.fileToPlot);
                        this.get2DData(file);

                        // Then store data in stored list
                    }
                } else {
                    // File is in saved, so let's plot it
                    this.currentData = data2D;
                    this.hexPlot(data2D, this.hexSettings);
                }
            } else {
                // console.log("No files select.");
                this.currentData = [];
                // Remove any current 2D plots
                d3.select(".chart-2D").remove();
                d3.select(".tooltip-2D").remove();
            }
        }
    }
  }
</script>

<style scoped>
@import '../../assets/styles/plot-2D-styles.css';

#Plot2D {
  position: absolute;
  left: 0;
  right: 0;  
}

/* Styles for control panel elements  */
#btn-reset-hex-settings {
  width: 100%;
}
</style>
