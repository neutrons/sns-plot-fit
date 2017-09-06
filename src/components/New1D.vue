<template>
  <div id="New1D" class="col-lg-12">
      <div class="container-fluid">
      <div class="col-lg-2">
        
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
                                        <td><button class="btn btn-danger btn-xs"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
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
                    :DISABLE="true"
                    @update-scales="setScales">
                </v-scales>

            </v-panel>
            
            <!-- Transformation Panel  -->
            <v-panel PANELTITLE="Transformations" PANELTYPE="success" :COLLAPSE="true">
                <v-transformation
                    :DISABLE="true"
                ></v-transformation>
            </v-panel>

            <!-- Fit Configuration Panel  -->
            <v-panel PANELTITLE="Fit Configurations" PANELTYPE="success" :COLLAPSE="true">
                <v-fit-config
                    :DISABLE="true"
                ></v-fit-config>
            </v-panel>

            <!-- Fit Settings Panel  -->
            <v-panel PANELTITLE="Levenberg–Marquardt Parameters" PANELTYPE="info" :COLLAPSE="true">
                <v-levenberg
                    :DISABLE="true"
                ></v-levenberg>
            </v-panel>


        </v-panel-group>
      </div>

      <div class="col-lg-10">
        <v-panel PANELTITLE="1D Plot" PANELTYPE="primary">
            <div id="plot-1D"></div>
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
import Panel from './BaseComponents/Panels/Panel.vue';
import PanelGroup from './BaseComponents/Panels/PanelGroup.vue';
import Table from './BaseComponents/Table.vue';
import Filter from './BaseComponents/TableFilter.vue';
import Scales from './BaseComponents/Scales.vue';
import Levenberg from './BaseComponents/Levenberg.vue';
import FitConfiguration from './BaseComponents/FitConfiguration.vue';
import Transformation from './BaseComponents/Transformation.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../assets/javascript/eventBus';

/* Import Mixins */
import { parse1D, pull1DData } from '../assets/javascript/mixins/readData.js';
import { fetchFiles } from '../assets/javascript/mixins/fetchFiles.js';

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
      'v-transformation': Transformation
    },
    data: function () {
      return {
        scales: {
            xScale: d3.scaleLinear(),
            yScale: d3.scaleLinear(),
        },
        filterBy: 'All',
        sortBy: 'ascending',
        filesToPlot: [],
        fileFitChoice: [],
        fileToFit: null
      }
    },
    mixins: [parse1D, pull1DData, fetchFiles],
    computed: {
      uploadFiles() {
        //   console.log("Store 1D", this.$store.getters.getUploaded1D);
          return _.cloneDeep(this.$store.getters.getUploaded1D);
      }
    },
    methods: {
        filterJob(filter) {
            this.filterBy = filter;
        },
        sortByDate(direction) {
            this.sortBy = direction;
        },
        setScales(xscale, yscale) {
            this.scales.xScale = this.$store.getters.getXScaleByID(xscale);
            this.scales.yScale = this.$store.getters.getYScaleByID(yscale);
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

            console.log("Here are the tempURLs", tempURLs);
            return tempURLs;
        }
    },
    watch: {
        scales: {
            handler: function() {
            
            },
            deep: true
        },
        filesToPlot: {
            // Watch if a file is selected, if so enable buttons and append selected data to a list
            handler: function () {
                var vm = this;
                
                if(this.filesToPlot.indexOf(this.fileToFit) === -1) {
                    this.fileToFit = null;
                    this.fileFitChoice = [];
                }
                
                // If a file is unselected while it has a fit, unselect the fit
                if(this.filesToPlot.length === 0) {
                    console.log("No files to plot");
                } else {

                    var filesToFetch = [];

                    // First check if files to plot are in stored data
                    var tempData = this.filesToPlot.map(function(filename) {
                        var temp = vm.$store.getters.getSaved1D(filename);
                    
                        console.log("Here is the temp:", temp);
                        if(temp === '999') {
                            console.log("Not in stored:", filename);
                            filesToFetch.push(filename);
                        } else {
                            return temp;
                        }

                    }).filter(item => item !== undefined);
                    
                    // Next fetch the file URLs
                    var fileURLs = this.getURLs(filesToFetch);

                    console.log("Got dem fileURLs", fileURLs);
                    if(fileURLs.length > 0) {
                        this.pull1DData(fileURLs, tempData);
                    } else {
                        console.log("Just plotting the stored data!", tempData);
                    }
                }
            },
            deep: true
        }
    }
  }
</script>

<style scoped>
@import '../assets/styles/plot-1D-styles.css';

#selection-error {
    position: absolute;
    top: 0;
    width: 100%;
}

#New1D {
  position: absolute;
  left: 0;
  right: 0;  
}
</style>
