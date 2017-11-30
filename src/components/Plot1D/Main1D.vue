<template>
  <div id="Main1D" class="col-md-12">
      <div class="container-fluid">
      <v-modal @close='showModal = false' v-if='showModal' header='SANS1D Previewer'>
        <v-quick-plot
            :id='ID'
            slot='body'
            :uploaded-files='getUploaded'
            :fetched-files='fetchFiles("SANS1D", sortBy, filterBy)'
            sub-component='DataPicker1D'
        ></v-quick-plot>
      </v-modal>
      <div class="col-md-2">
        
        <!-- Files Main Panel  -->
        <v-panel-group MAINTITLE="Files" PANELTYPE="primary">
        <button class='btn btn-success btn-xs pull-left'
            @click='showModal = true' slot='title-content'
            v-if='isFilesAvailable'
        >Quick Plot</button>
        

            <!-- Fetched Data Panel  -->
                <v-panel PANELTITLE="Fetched" PANELTYPE="success" v-if="!isOffline">
                    <div v-show="fetchFiles.length > 0">
                        <div>
                            <v-filter
                                group-type="SANS1D"
                                @filter-job="filterJob"
                                @sort-by-date="sortByDate"
                            ></v-filter>
                        </div>
                        <v-table :fieldNames="['Fit', 'Plot', 'Filename', 'Group']">
                            <template>
                                <tr v-for="f in fetchFiles('SANS1D', sortBy, filterBy)" :class="isPlotted(f.filename)">
                                    <template>
                                        <td class="td-check"><input type="checkbox" :value="f.filename" v-model="fileFitChoice" :disabled=" (isPlotted(f.filename) == 'success' ? false : true)"
                            @change="setFileToFit"></td>
                                        <td class="td-check"><input :id="f.filename + '-Fetch1D'" type="checkbox" :value="f.filename" v-model="filesToPlot" @change='setFilesToPlot'></td>
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
                                        <td class="td-check"><input :id="f.filename + '-Upload1D'" type="checkbox" :value="f.filename" v-model="filesToPlot" @change='setFilesToPlot'></td>
                                        <td class="td-name">{{f.filename}}</td>
                                        <td class="td-name"><button class="btn btn-danger btn-xs" @click="remove1DFile(f.filename)"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
                                    </template>
                                </tr>
                            </template>
                        </v-table>
                    </div>
                </v-panel>

                <div id="btn-selections" v-if="isFiles" class="btn-group btn-group-justified">
                        <div class="btn-group"><button class="btn btn-default btn-select-all" @click="checkAll"><i class="fa fa-plus-circle" aria-hidden="true"></i> Plot All</button></div>
                        <div class="btn-group"><button class="btn btn-default btn-unselect-all" @click="clearSelected" :disabled="disable"><i class="fa fa-minus-circle" aria-hidden="true"></i> Remove All</button></div>
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
                    ref="scale">
                </v-scales>

            </v-panel>
            
            <!-- Transformation Panel  -->
            <v-panel PANELTITLE="Transformations" PANELTYPE="success" :COLLAPSE="true">
                <v-transformation
                    :XTRANS="$data.currentConfiguration.transformations.x"
                    :YTRANS="$data.currentConfiguration.transformations.y"
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
                    :ID='ID'
                    @set-fit="setFit"
                    @set-fit-setting="setFitSettings"
                    @set-equation="setEquation"
                    @reset-file-fit-choice="resetFileFitChoice"
                    ref="fit_configurations"
                ></v-fit-config>
            </v-panel>

            <!-- Fit Settings Panel  -->
            <v-panel PANELTITLE="Levenberg–Marquardt Settings" PANELTYPE="info" :COLLAPSE="true">
                <v-fit-settings-panel
                    :disable='this.fileToFit === null'
                    :data='selectedData'
                    :file-to-fit='fileToFit'
                    :field='field'
                    :parameters='currentConfiguration.settings.parameters'
                    :initial-values='currentConfiguration.settings.initialValues'
                    @update-parameters='updateConfigParameters'
                    @update-initial-values='updateInitialValues'
                >
                    <button class='btn btn-warning btn-sm btn-block' 
                        @click='resetFitSettings'>
                        <i class='fa fa-refresh' aria-hidden='true'></i> Default Settings
                    </button>
                </v-fit-settings-panel>
            </v-panel>


        </v-panel-group>
      </div>
    
        <v-plot-1D
            :DISABLE="disable"
            :SHOWTABLE="fileToFit !== null && $data.currentConfiguration.fit !== 'None'"
            ref="plot_SANS1D"
        ></v-plot-1D>
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
import Transformation from '../BaseComponents/Transformation.vue';
import FitConfiguration from '../BaseComponents/Fittings/FitConfiguration.vue';
import Plot1D from './components/fitPlot.vue';
import FitSettingsPanel from '../BaseComponents/Fittings/FitSettingsPanel.vue';
import Modal from '../BaseComponents/Modal.vue';
import QuickPlot from '../BaseComponents/QuickPlot/QuickPlot.vue';

/* Import Shared Mixins */
import parseData from '../../assets/javascript/mixins/readFiles/parse/SANS1D.js';
import fd from '../../assets/javascript/mixins/fittings/fitData.js';
import {fitMethods} from '../../assets/javascript/mixins/fittings/fitMethods.js';
import {transformMethods} from '../../assets/javascript/mixins/transformMethods.js';
import {fitInitialValues} from '../../assets/javascript/mixins/fittings/fitInitialValues.js';

import {read1DData} from '../../assets/javascript/mixins/readFiles/default.js';
import {isPlotted} from '../../assets/javascript/mixins/isPlotted.js';
import {removeFile} from '../../assets/javascript/mixins/removeFile.js';
import {prepPlotData} from '../../assets/javascript/mixins/prepPlotData.js';
import {setScales} from '../../assets/javascript/mixins/setScales.js';
import {fetchFiles} from '../../assets/javascript/mixins/fetchFiles.js';
import {filterJobs} from '../../assets/javascript/mixins/filterJobs.js';
import {isOffline} from '../../assets/javascript/mixins/isOffline.js';

// The eventBus serves as the means to communicating between components.
import { eventBus } from '../../assets/javascript/eventBus';

export default {
    name: 'Main1D',
    components: {
      'v-panel-group': PanelGroup,
      'v-panel': Panel,
      'v-table': Table,
      'v-filter': Filter,
      'v-scales': Scales,
      'v-fit-config': FitConfiguration,
      'v-transformation': Transformation,
      'v-plot-1D': Plot1D,
      'v-fit-settings-panel': FitSettingsPanel,
      'v-modal': Modal,
      'v-quick-plot': QuickPlot,
    },
    data: function () {
      return {
        selectedData: [],
        scale: {
          x: d3.scaleLinear(),
          xType: 'X',
          y: d3.scaleLinear(),
          yType: 'Y'
        },
        disable: true,
        plotParams: {},
        filterBy: 'All',
        sortBy: 'ascending',
        filesToPlot: [],
        currentData: [],
        ID: 'SANS1D',
        field: {
            x: 'x',
            y: 'y',
        },
        showModal: false,
      };
    },
    mixins: [
        read1DData,
        fetchFiles,
        setScales,
        filterJobs,
        isOffline,
        isPlotted,
        removeFile,
        prepPlotData,
        fitMethods,
        transformMethods,
        fitInitialValues,
    ],
    computed: {
        isFilesAvailable() {
            let fetchKeys = Object.keys(this.fetchFiles('SANS1D', this.sortBy, this.filterBy));
            let uploadKeys = Object.keys(this.getUploaded);

            return fetchKeys.length > 0 || uploadKeys.length > 0;
        },
        isFiles() {
            let fetchLength = this.$store.getters.getFetched('SANS1D').length;
            let uploadLength = this.$store.getters.getUploaded('SANS1D').length;
            
            return fetchLength > 0 || uploadLength > 0 ? true : false;
        },
        getUploaded() {
            return this.$store.getters.getUploaded('SANS1D');
        }
    },
    mounted() {
        let vm = this;

        // Event listener for scatter point removal
        eventBus.$on('update-selected-data-SANS1D', vm.updateSelectedData);
    },
    methods: {
        updateSelectedData(index, name) {

            this.selectedData.forEach(el => {

                if (name === el.filename) { 
                    el.data.splice(index,1); 
                    el.dataTransformed.splice(index, 1); 
                };
            })
        },
        clearSelected() {
            this.fileFitChoice = [];
            this.filesToPlot = [];
            this.fileToFit = null;
        },
        checkAll() {
            
            let fetched = this.$store.getters.getFetched('SANS1D');
            let uploaded = this.$store.getters.getUploaded('SANS1D');

            for (let i = 0, len = fetched.length; i < len; i++) {
                let fname = fetched[i].filename;

                if (this.filesToPlot.indexOf(fname) === -1) {
                    this.filesToPlot.push(fname);
                }
            }
            
            for (let i = 0, len = uploaded.length; i < len; i++) {
                let fname = uploaded[i].filename;

                if (this.filesToPlot.indexOf(fname) === -1) {
                    this.filesToPlot.push(fname);
                }
            }
        },
        remove1DFile(filename) {

            let vm = this;

            this.removeFile('SANS1D', filename, function() {
                if (vm.fileToFit === filename)    vm.fileToFit = null;
            })
        },
        setCurrentData(chosenData, checkList) {           
            var vm = this;

            chosenData = _.cloneDeep(chosenData);
            
            if (checkList.length == 0) {
                // If no data is selected to be plotted, then
                // remove any elements previously plotted
                // and reset to default values
                // console.log("Removing plot elements...");

                d3.select(".chart-SANS1D").remove();
                d3.select("#tooltip-SANS1D").remove();

                this.resetScales();
                this.resetFileFitChoice();
                this.disableButtons(false);
                this.selectedData = [];
                this.fileToFit = null;
            } else {
                let tempSelect = [];

                for (let i = 0, len = chosenData.length; i < len; i++) {
                    
                    let temp = chosenData[i].data;
                    let name = chosenData[i].filename;

                    if (this.currentConfiguration.transformations.x !== 'x' || this.currentConfiguration.transformations.y !== 'y') {
                        let dataTransformed = fd.transformData(temp, this.currentConfiguration.transformations, this.field);
                        
                        tempSelect.push({filename: name, data: temp, dataTransformed: dataTransformed });
                    } else {
                        let dataTransformed = _.cloneDeep(temp);

                        tempSelect.push({filename: name, data: temp, dataTransformed: dataTransformed });
                    }
                }

                this.selectedData = tempSelect;
            }

            this.setParameters();
        },
        setFilesToPlot() {
            var vm = this;

            // If a file is unselected while it has a fit, unselect the fit
            if (this.fileToFit !== null && this.filesToPlot.indexOf(this.fileToFit) === -1) {
                this.resetFileFitChoice();
            }
            
            if (this.filesToPlot.length === 0) {
                // There should be nothing to plot or fit,
                // so reset everything to defaults.
                // Remove any elements previously plotted
                d3.select(".chart-SANS1D").remove();
                d3.select("#tooltip-SANS1D").remove();

                // Reset disable to default 'true'
                this.disable = true;
                
                // Reset X & Y Scales back to default
                this.resetScales();

                // Reset X & Y Transformations back to default
                this.resetTransformations();
                
                // Reset coefficients to an empty object
                this.$refs.fit_configurations.$data.coefficients = {};
                
                // Reset selected data to an empty array
                this.selectedData = [];
                
                console.log("No files to plot");

            } else {
                this.disable = false;
                var filesToFetch = [];

                // First check if files to plot are in stored data
                var tempData = this.filesToPlot.map(function(filename) {
                    
                    var temp = vm.$store.getters.getSavedFile('SANS1D', filename);
                
                    // console.log("Here is the temp:", temp);
                    if (temp === '999') {
                        // console.log("Not in stored:", filename);
                        filesToFetch.push(filename);
                    } else {
                        return temp;
                    }

                }).filter(item => item !== undefined);
                
                // Next fetch the file URLs
                var fileURLs = this.$store.getters.getURLs(filesToFetch, 'SANS1D');
                
                if (fileURLs.length > 0) {
                    this.read1DData(fileURLs, tempData, 'SANS1D', parseData);
                } else {
                    this.setCurrentData(tempData, this.filesToPlot);
                }
            }
        },
        prepData(sd) {

            return this.prepPlotData(sd, function() {
                    let temp = [];

                    for (let i = 0; i < sd.length; i++) temp.push(sd[i].dataTransformed);

                    return temp;
                });
        },
        setParameters() {
            // Next tick is used to wait for all parameter changes to be updated
            // This is a to prevent the 'De-selecting' of all plotted data at once.
            this.$nextTick(function() {
                if (this.selectedData.length > 0) {
                    // console.log("Setting parameters", this.selectedData);

                    this.$refs.plot_SANS1D.setParameters({
                        data: this.prepData(this.selectedData),
                        colorDomain: this.$store.getters.getColorDomain('SANS1D'),
                        scale: this.scale,
                        fileToFit: this.fileToFit,
                        fitConfiguration: this.fileToFit === null ? this.currentConfiguration : this.prepConfiguration(), //currentConfiguration,
                        label: {
                            x: this.currentConfiguration.transformations.x,
                            y: this.currentConfiguration.transformations.y
                        }
                    });
                } else {
                    // Remove any elements previously plotted
                    d3.select(".chart-SANS1D").remove();
                    d3.select("#tooltip-SANS1D").remove();
                }
            })
        },
    },
  };
</script>

<style lang="less" scoped>
#Main1D {
  position: absolute;
  left: 0;
  right: 0;
  padding: 0px;
}

.btn-select-all, .btn-unselect-all {
    padding: 2px;

    @media screen and (min-width: 1441px) { font-size: 12px; }
    @media screen and (max-width: 1440px) { font-size: 8px; }

}
</style>
