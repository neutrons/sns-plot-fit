<template>
  <div id="TAS" class="col-md-12">
      <div class="container-fluid">
      <div class="col-md-2">
        
        <!-- Files Main Panel  -->
        <v-panel-group MAINTITLE="Files" PANELTYPE="primary">

            <!-- Fetched Data Panel  -->
                <v-panel PANELTITLE="Fetched" PANELTYPE="success" v-if="!isOffline">
                    <div v-show="fetchFiles.length > 0">
                        <div>
                            <v-filter
                                group-type="TAS"
                                @filter-job="filterJob"
                                @sort-by-date="sortByDate"
                            ></v-filter>
                        </div>
                        <v-table :fieldNames="['Fit', 'Plot', 'Filename', 'Group']">
                            <template>
                                <tr v-for="f in fetchFiles('TAS', sortBy, filterBy)" :class="isPlotted(f.filename)">
                                    <template>
                                        <td class="td-check"><input type="checkbox" :value="f.filename" v-model="fileFitChoice" :disabled=" (isPlotted(f.filename) == 'success' ? false : true)"
                            @change="setFileToFit"></td>
                                        <td class="td-check"><input :id="f.filename + '-FetchTAS'" type="checkbox" :value="f.filename" v-model="filesToPlot" @change="setFileToPlot"></td>
                                        <td class="td-name">{{f.filename}}</td>
                                        <td class="td-name">{{f.jobTitle}}</td>
                                    </template>
                                </tr>
                            </template>
                        </v-table>
                    </div>
                </v-panel>

            <!-- Uploaded Data Panel  -->
                <v-panel PANELTITLE="Uploaded" PANELTYPE="success">
                    <div v-show="getUploaded.length > 0">
                     <v-table :fieldNames="['Fit', 'Plot', 'Filename', 'Delete']">
                            <template>
                                <tr v-for="f in getUploaded" :class="isPlotted(f.filename)">
                                    <template>
                                        <td class="td-check"><input type="checkbox" :value="f.filename" v-model="fileFitChoice" :disabled=" (isPlotted(f.filename) == 'success' ? false : true)"
                            @change="setFileToFit"></td>
                                        <td class="td-check"><input :id="f.filename + '-UploadTAS'" type="checkbox" :value="f.filename" v-model="filesToPlot" @change="setFileToPlot"></td>
                                        <td class="td-name">{{f.filename}}</td>
                                        <td class="td-name"><button class="btn btn-danger btn-xs" @click="removeFile(f.filename)"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
                                    </template>
                                </tr>
                            </template>
                        </v-table>
                    </div>
                </v-panel>
            </v-panel-group>

        <!-- Controls Main Panel  -->
        <v-panel-group MAINTITLE="Controls" PANELTYPE="primary">
            <!-- Field Name Panel -->
            <v-panel PANELTITLE="Field Names" PANELTYPE="success" :COLLAPSE="false">
                <v-field-list 
                    :current-data="currentData"
                    @update-fields="updateFields"
                    ref="fields"
                >
                </v-field-list>
            </v-panel>
            <!-- Scales Panel  -->
            <!-- <v-panel PANELTITLE="Scales" PANELTYPE="success" :COLLAPSE="false">

                <v-scales 
                    :DISABLE="disable"
                    @update-scales="setScales"
                    @reset-scales="resetScales"
                    ref="scales">
                </v-scales>

            </v-panel> -->

            <!-- Fit Configuration Panel  -->
            <!-- <v-panel PANELTITLE="Fit Configurations" PANELTYPE="success" :COLLAPSE="true">
                <v-fit-config
                    :DISABLE="this.fileToFit === null"
                    :EQUATION="$data.currentConfiguration.equation"
                    @set-fit="setFit"
                    @set-fit-setting="setFitSettings"
                    @set-equation="setEquation"
                    @reset-file-fit-choice="resetFileFitChoice"
                    ref="fit_configurations"
                ></v-fit-config>
            </v-panel> -->

            <!-- Fit Settings Panel  -->
            <!-- <v-panel PANELTITLE="Levenberg–Marquardt Settings" PANELTYPE="info" :COLLAPSE="true">
                <v-levenberg
                    :DISABLE="this.fileToFit === null"
                    @set-fit-settings="setFitSettings"
                    ref="fit_settings"
                ></v-levenberg>
            </v-panel> -->


        </v-panel-group>
      </div>
    
        <v-plot-TAS
            :DISABLE="disable"
            :METADATA="metadata"
            ref="plot_TAS"
        ></v-plot-TAS>
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
import tasPlot from './tasPlot.vue';
import FieldList from './components/FieldList.vue';

/* Import Mixins */
import { isPlotted } from '../../assets/javascript/mixins/isPlotted.js';
import { setScales } from '../../assets/javascript/mixins/setScales.js';
import { fetchFiles } from '../../assets/javascript/mixins/fetchFiles.js';
import { filterJobs } from '../../assets/javascript/mixins/filterJobs.js';
import { isOffline } from '../../assets/javascript/mixins/isOffline.js';
import { parseTAS, readTASData, getTASData, extractMetadata } from '../../assets/javascript/mixins/readFiles/readTAS.js';

// The eventBus serves as the means to communicating between components.
import { eventBus } from '../../assets/javascript/eventBus';

import getDefaultData from './mixins/getDefaultData.js';

export default {
    name: 'TAS',
    components: {
        'v-panel-group': PanelGroup,
        'v-panel': Panel,
        'v-table': Table,
        'v-filter': Filter,
        'v-scales': Scales,
        'v-levenberg': Levenberg,
        'v-fit-config': FitConfiguration,
        'v-plot-TAS': tasPlot,
        'v-field-list': FieldList,
    },
    data: getDefaultData,
    mixins: [
        fetchFiles, 
        setScales, 
        filterJobs,
        isPlotted,
        isOffline,
        parseTAS,
        readTASData,
        getTASData,
        extractMetadata
    ],
    computed: {
        getUploaded() {
          return this.$store.getters.getUploaded('TAS');
        },
        metadata() {
            return this.currentData.metadata;
        }
    },
    methods: {
        resetData() {
            this.removePlot();

            Object.assign(this.$data, getDefaultData())

        },
        removePlot() {
            d3.select(".chart-" + this.ID).remove();
            d3.select(".tooltip-" + this.ID).remove();
        },
        setFileToFit() {
            if (this.fileFitChoice.length > 0) this.fileFitChoice = this.fileFitChoice.slice(-1);
            this.fileToFit = this.fileFitChoice[0] ? this.fileFitChoice[0] : null;
        },
        setFileToPlot() {
            if (this.filesToPlot.length > 0) this.filesToPlot = this.filesToPlot.slice(-1);
            
            this.fileToPlot = this.filesToPlot[0] ? this.filesToPlot[0] : null;
        },
        resetFileFitChoice() {
            this.fileFitChoice = [];
            this.fileToFit = null;
        },
        setFitFile(filename) {
             this.fileToFit = filename;
        },
        setFit(fitname) {
            // console.log("Setting new fit configuration:", fitname);
            // Deep clone because if you change the equation later, the original fit config's equation would be altered as well
            this.currentConfiguration = _.cloneDeep(this.$store.getters.getFitConfigsByID(fitname));
        },
        setFitSettings(options) {
            this.fitSettings = options;
        },
        setEquation(eq) {
            this.currentConfiguration.equation = eq;
        },
        removeFile(filename) {
            let vm = this;

            // If file is in fileToPlot or filesToPlot, remove it
            // and remove plot elements
            if (this.fileToPlot === filename) {
                this.fileToPlot = null;
                this.filesToPlot = [];

                // If file is also being fit, reset to defaults
                if (this.fileToFit === filename) {
                    this.fileToFit = null;
                    this.fileFitChoice = [];
                }
            }

            this.removePlot();

            this.$store.commit('removeFile', { filename: filename, dataType: 'TAS'});
        },
        updateFields(choice, value) {
            //console.log("Changed field: " + type + " | To value = " + value);

            if (choice === 'x') {
                this.fields.x = value;
            } else if (choice === 'y') {
                this.fields.y = value;
            } else {
                [this.fields.x, this.fields.y] = [this.fields.y, this.fields.x];
            }
            
            d3.select('#xLabel-TAS').text(this.fields.x);
            d3.select('#yLabel-TAS').text(this.fields.y);

            this.setParameters();
        },
        prepData(sd) {

            // code here to prep data for plotting
        },
        setParameters() {
            // Next tick is used to wait for all parameter changes to be updated
            // This is a to prevent the 'De-selecting' of all plotted data at once.
            this.$nextTick(function() {
                if (this.currentData.data !== undefined) {
                    // Code here to plot data
                    this.disable = false;

                    this.$refs.plot_TAS.drawPlot({
                        fields: this.fields,
                        data: this.currentData,
                        scales: this.scales,
                        colorDomain: this.$store.getters.getColorDomain('TAS'),
                        labels: {
                            x: this.fields.x,
                            y: this.fields.y
                        }
                    })
                } else {
                    console.log("no data to plot...");
                    // Remove any elements previously plotted
                    this.resetData();

                    this.$refs.fields.resetSelected();
                }
            })
        },
    },
    watch: {
        scales: {
            handler() {
                this.$nextTick(function() {
                    // code to handle scale changes
                })
            },
            deep: true
        },
        fileToFit () {
            
            if (this.fileToFit === null) {
                
                // this.$refs.fit_configurations.setFitBack();
                // this.setFitSettings(this.$store.getters.getFitSettings);
                // this.setFit("Linear");
            } else {
                // this.selectedData.forEach( el => {
                //     el.dataTransformed = fd.transformData(el.data, this.currentConfiguration);
                // });
            }
        },
        currentConfiguration: {
            handler() {
                // console.log("Current configurations changed!");
                // if(this.currentConfiguration.xTransformation !== 'x' || this.currentConfiguration.yTransformation !== 'y') {
                //     this.selectedData.forEach( el => {
                //         el.dataTransformed = fd.transformData(el.data, this.currentConfiguration);
                //     });
                // } else {
                //     this.selectedData.forEach( el => {
                //         el.dataTransformed = _.cloneDeep(el.data);
                //     });
                // }
            },
            deep: true
        },
        fitSettings: {
            handler: function() {
                // this.setParameters();
            },
            deep: true
        },
        fileToPlot() {
            let vm = this;

            // Check if file is in the stored TAS list
            // a value of '999' means no data is stored
            if (this.fileToPlot !== null) {
                let dataTAS = this.$store.getters.getSavedFile('TAS', this.fileToPlot);

                // If not, Check if the file is in the Fetched list or Uploaded
                if (dataTAS === '999') {
                    var inUploadTAS = this.$store.getters.inUploadedTAS(this.fileToPlot);

                    if (inUploadTAS) {
                        // It's an uploaded file so read the data from blob
                        var file = this.$store.getters.getTASFile(this.fileToPlot, 'uploaded');

                        this.readTASData(file);

                    } else {
                        // It's a fetched file so get file then get the data url
                        var file = this.$store.getters.getTASFile(this.fileToPlot, 'fetched');

                        this.getTASData(file);
                    }
                } else {
                    // File is in saved, so let's plot it
                    this.currentData = dataTAS;
                    this.setParameters();
                }
            } else {               
                console.log("No files selected...");
                this.resetData();
            }
        }
    }
}
</script>

<style lang="less" scoped>
#TAS {
  position: absolute;
  left: 0;
  right: 0;
  padding: 0px;
}
</style>
