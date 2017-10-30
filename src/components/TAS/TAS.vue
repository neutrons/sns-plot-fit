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
                            ></v-filter>
                        </div>
                        <v-table :fieldNames="['Fit', 'Plot', 'Filename', 'Group']">
                            <template>
                                <tr v-for="f in fetchFiles('TAS', sortBy, filterBy)" :class="isPlotted(f.filename)">
                                    <template>
                                        <td class="td-check"><input type="checkbox" :value="f.filename" v-model="fileFitChoice" :disabled=" (isPlotted(f.filename) == 'success' ? false : true)"
                            @change="setFileToFit"></td>
                                        <td class="td-check"><input :id="f.filename + '-FetchTAS'" type="checkbox" :value="f.filename" v-model="filesToPlot"></td>
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
                                        <td class="td-check"><input type="checkbox" :value="f.filename" v-model="fileFitChoice" :disabled="(isPlotted(f.filename) == 'success' ? false : true)"
                            @change="setFileToFit"></td>
                                        <td class="td-check"><input :id="f.filename + '-UploadTAS'" type="checkbox" :value="f.filename" v-model="filesToPlot"></td>
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
            <!-- Scales Panel  -->
            <v-panel PANELTITLE="Scales" PANELTYPE="success" :COLLAPSE="false">

                <v-scales 
                    :DISABLE="disable"
                    @update-scales="setScales"
                    @reset-scales="resetScales"
                    ref="scales">
                </v-scales>

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
            <v-panel PANELTITLE="Levenberg–Marquardt Settings" PANELTYPE="info" :COLLAPSE="true">
                <v-levenberg
                    :DISABLE="this.fileToFit === null"
                    @set-fit-settings="setFitSettings"
                    ref="fit_settings"
                ></v-levenberg>
            </v-panel>


        </v-panel-group>
      </div>
    
        <v-plot-TAS
            :DISABLE="disable"
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

/* Import Mixins */
import { isPlotted } from '../../assets/javascript/mixins/isPlotted.js';
import { setScales } from '../../assets/javascript/mixins/setScales.js';
import { fetchFiles } from '../../assets/javascript/mixins/fetchFiles.js';
import { filterJobs } from '../../assets/javascript/mixins/filterJobs.js';
import { isOffline } from '../../assets/javascript/mixins/isOffline.js';

// The eventBus serves as the means to communicating between components.
import { eventBus } from '../../assets/javascript/eventBus';

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
    },
    data: function () {
      return {
        msg: 'TAS Component!',
        filesToPlot: [],
        fileToFit: null,
        fileFitChoice: [],
        selectedData: [],
        filterBy: 'All',
        sortBy: 'ascending',
        disable: true,
        currentConfiguration: {
            fit: 'Linear',
            equation: 'm*x+b',
            yTransformation: 'y',
            xTransformation: 'x',
            eTransformation: "e",
            yLabel: "I",
            xLabel: "Q",
            note: ""
        }
      }
    },
    mixins: [
        fetchFiles, 
        setScales, 
        filterJobs,
        isPlotted,
        isOffline
    ],
    computed: {
        getUploaded() {
          return this.$store.getters.getUploaded('TAS');
      }
    },
    methods: {
         setFileToFit() {
            if (this.fileFitChoice.length > 0) this.fileFitChoice = this.fileFitChoice.slice(-1);
            this.fileToFit = this.fileFitChoice[0] ? this.fileFitChoice[0] : null;
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
        prepData(sd) {

            // code here to prep data for plotting
        },
        setParameters() {
            // Next tick is used to wait for all parameter changes to be updated
            // This is a to prevent the 'De-selecting' of all plotted data at once.
            this.$nextTick(function() {
                if(this.selectedData.length > 0) {
                    // Code here to plot data
                } else {
                    // Remove any elements previously plotted
                    d3.select(".chart-TAS").remove();
                    d3.select("#tooltip-TAS").remove();
                }
            })
        },
        setFitSettings(options) {
            this.fitSettings = options;
        },
        setEquation(eq) {
            this.currentConfiguration.equation = eq;
        }
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
        selectedData: {
            handler() {
                this.setParameters();
            },
            deep: true
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
                this.setParameters();
            },
            deep: true
        },
        filesToPlot: {
            // Watch if a file is selected, if so enable buttons and append selected data to a list
            handler () {
                var vm = this;

                // code to handle files to plot

                }
            },
            deep: true
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
