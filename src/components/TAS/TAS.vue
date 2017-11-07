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
                                        <td class="td-check"><input :id="f.filename + '-FetchTAS'" type="checkbox" :value="f.filename" v-model="filesToPlot" @change="setFilesToPlot"></td>
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
                                        <td class="td-check"><input :id="f.filename + '-UploadTAS'" type="checkbox" :value="f.filename" v-model="filesToPlot" @change="setFilesToPlot"></td>
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
                    :current-fields="currentFields"
                    @update-fields="updateFields"
                    ref="fields"
                >
                </v-field-list>
            </v-panel>

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
    
        <v-plot-TAS :DISABLE="disable"  ref="plot_TAS">
            <v-metadata :metadata="metadata" :ID="ID"></v-metadata>
        </v-plot-TAS>
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
import tasPlot from './components/tasPlot.vue';
import FieldList from './components/FieldList.vue';
import Metadata from './components/Metadata.vue';

/* Import Mixins */
import { isPlotted } from '../../assets/javascript/mixins/isPlotted.js';
import { setScales } from '../../assets/javascript/mixins/setScales.js';
import { fetchFiles } from '../../assets/javascript/mixins/fetchFiles.js';
import { filterJobs } from '../../assets/javascript/mixins/filterJobs.js';
import { isOffline } from '../../assets/javascript/mixins/isOffline.js';
import { read1DData } from '../../assets/javascript/mixins/readFiles/default.js';
import parseData from '../../assets/javascript/mixins/readFiles/parse/TAS.js';
import { prepPlotData } from '../../assets/javascript/mixins/prepPlotData.js';

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
        'v-plot-TAS': tasPlot,
        'v-field-list': FieldList,
        'v-metadata': Metadata
    },
    data: getDefaultData,
    mixins: [
        fetchFiles, 
        setScales, 
        filterJobs,
        isPlotted,
        isOffline,
        read1DData,
        prepPlotData
    ],
    mounted() {
        // Listen for event that stitch has been saved
        let vm = this;

        eventBus.$on('update-selected-data-TAS', vm.updateSelectedData);
    },
    computed: {
        getUploaded() {
          return this.$store.getters.getUploaded('TAS');
        },
        metadata() {
            let tm = {};

            this.selectedData.forEach(el => {
                tm[el.filename] = el.metadata;
            })

            return tm;
        },
        currentFields() {
            let tf = [];

            this.selectedData.forEach(el => {
                let f = Object.keys(el.data[0]);
                tf = tf.concat(f);
            })

            tf = _.chain(tf)
                .uniq()
                .remove((d) => { return d !== 'name'; })
                .sort()
                .value();

            return tf;
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
        updateSelectedData(index, name) {
            
            this.selectedData.forEach(el => {

                if (name === el.filename)   el.data.splice(index,1);
                
            })

            this.setParameters();
        },
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

            if (choice === 'x') {
                this.fields.x = value;
            } else if (choice === 'y') {
                this.fields.y = value;
            } else {
                [this.fields.x, this.fields.y] = [this.fields.y, this.fields.x];
            }

            this.setParameters();
        },
        setCurrentData(chosenData, checkList) {            
            var vm = this;

            chosenData = _.cloneDeep(chosenData);
            
            if (checkList.length == 0) {
                this.resetData();
            } else {
                let tempSelect = [];

                for (let i = 0, len = chosenData.length; i < len; i++) {
                    
                    let temp = chosenData[i].data;
                    let name = chosenData[i].filename;
                    let metadata = chosenData[i].metadata;

                    tempSelect.push({filename: name, data: temp, metadata});

                    // if (this.currentConfiguration.xTransformation !== 'x' || this.currentConfiguration.yTransformation !== 'y') {
                    //     let dataTransformed = fd.transformData(temp, this.currentConfiguration);
                        
                    //     tempSelect.push({filename: name, data: temp, dataTransformed: dataTransformed });
                    // } else {
                    //     let dataTransformed = _.cloneDeep(temp);

                    //     tempSelect.push({filename: name, data: temp, dataTransformed: dataTransformed });
                    // }
                }

                this.selectedData = tempSelect;
            }

            // Always set parameters after new data is selected
            this.setParameters();
        },
        prepData(sd) {    
            let vm = this;

            // Assign fields if none were provided yet
            if (this.fields.x === null || this.fields.y === null) {
                [this.fields.x, this.fields.y] = this.getFields();
            }

            // Filter out data for selected fields
            sd.forEach(el => {

                el.data = el.data.map(function(d) {
                    return {x: d[vm.fields.x], y: d[vm.fields.y], name: d.name};
                })
            })

            // console.log("SD:", sd);
            let tempData = this.prepPlotData(sd, function() {
                    let temp = [];

                    for (let i = 0; i < sd.length; i++) temp.push(sd[i].data);

                    return temp;
            });

            return _.cloneDeep(tempData);
        },
        setParameters() {
            let vm = this;

            this.$nextTick(function() {
                if (this.selectedData.length > 0) {
                    // console.log("Setting parameters", this.selectedData);
                    this.disable = false;

                    this.$refs.plot_TAS.drawPlot({
                        data: vm.prepData(_.cloneDeep(vm.selectedData)),
                        colorDomain: vm.$store.getters.getColorDomain('TAS'),
                        scales: vm.scales,
                        fileToFit: vm.fileToFit,
                        fitConfiguration: vm.currentConfiguration,
                        fitSettings: vm.fitSettings,
                        labels: {
                            x: vm.fields.x,
                            y: vm.fields.y
                        }
                    });
                } else {
                    this.resetData();
                    this.$refs.fields.resetSelected();
                }
            })
        },
        setFilesToPlot() {
            var vm = this;

                // If a file is unselected while it has a fit, unselect the fit
                if (this.filesToPlot.indexOf(this.fileToFit) === -1) {
                    this.fileToFit = null;
                    this.fileFitChoice = [];
                }
                
                if (this.filesToPlot.length === 0) {
                    console.log("No files to plot");
                    this.resetData();
                    this.$refs.fields.resetSelected();
                } else {
                    var filesToFetch = [];

                    // First check if files to plot are in stored data
                    var tempData = this.filesToPlot.map(function(filename) {
                       
                        var temp = vm.$store.getters.getSavedFile('TAS', filename);
                    
                        // console.log("Here is the temp:", temp);
                        if (temp === '999') {
                            // console.log("Not in stored:", filename);
                            filesToFetch.push(filename);
                        } else {
                            return temp;
                        }

                    }).filter(item => item !== undefined);
                    
                    // Next fetch the file URLs
                    var fileURLs = this.$store.getters.getURLs(filesToFetch, 'TAS');
                    
                    if (fileURLs.length > 0) {
                        this.read1DData(fileURLs, tempData, 'TAS', parseData);
                    } else {
                        this.setCurrentData(tempData, this.filesToPlot);
                    }
                }
        }
    },
    watch: {
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
