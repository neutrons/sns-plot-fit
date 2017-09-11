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
                                        <td><input :id="f.filename + '-Fetch1D'" type="checkbox" :value="f.filename" v-model="filesToPlot"></td>
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
                                        <td><button class="btn btn-danger btn-xs"><i class="fa fa-trash" aria-hidden="true"></i></button></td>
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

                    <button class="btn btn-default zoomToggle" :disabled="disable"><i class="fa fa-search-plus" aria-hidden="true"></i> Toggle zoom</button>
                    <button class="btn btn-default brushToggle" :disabled="disable"><i class="fa fa-square-o" aria-hidden="true"></i> Toggle brush</button>

                </v-panel>

            </v-panel-group>
        </div>

        <!-- Plot Panel for Main Chart  -->
        <v-stitch-plot 
            :DISABLE="disable"
            ref="stitchPlot">
        </v-stitch-plot>
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
import Stitch from './PlotStitch.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

/* Import Mixins */
import { fetchFiles } from '../../assets/javascript/mixins/fetchFiles.js';
import { parse1D, pull1DData } from '../../assets/javascript/mixins/readData.js';

export default {
    name: 'Stitch',
    components: {
      'v-panel-group': PanelGroup,
      'v-panel': Panel,
      'v-scales': Scales,
      'v-table': Table,
      'v-filter': TableFilter,
      'v-stitch-plot': Stitch
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
          selectedData: []
      }
    },
    mixins: [fetchFiles, parse1D, pull1DData],
    computed: {
      xScales() {
        return this.$store.getters.getXScales;
      },
      yScales() {
        return this.$store.getters.getYScales;
      },
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
        setCurrentData(chosenData, checkList) {

            console.log("setting current data:", chosenData, checkList);
            // console.log("selected data should be empty:", this.selectedData);
            
            var vm = this;
            if (checkList.length == 0) {
                // If no data is selected to be plotted, then
                // remove any elements previously plotted
                // and reset to default values
                console.log("Removing plot elements...");
                d3.select(".stitch-chart").remove();
                // d3.select(".tooltip-stitch").remove();

                // eventBus.$emit('reset-scales');
                this.selectedData = [];
            } else {
                var toFilter = [];
                
                // Remove any instances where checked file isn't in selected
                this.selectedData = this.selectedData.filter(function(item) { 
                    var match = checkList.indexOf(item.filename);
                    console.log("Match:", match);

                    if(match > -1) {
                        toFilter.push(checkList[match]);
                    }

                    return checkList.indexOf(item.filename) > -1;
                });

                // Filter out data that doesn't need to be added and keep the rest
                checkList.filter(el => toFilter.indexOf(el) < 0).map(function(fname) {
                    console.log("Filename: ", fname);
                    let temp = chosenData.find(el => el.filename === fname);
                    
                    vm.selectedData.push(temp);
                });

            }
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
                temp.push(sd[i].data);
            }
            // console.log("Merging data:", _.flatten(temp));
            return _.flatten(temp);
        },
        setParameters() {
            this.$nextTick(function() {
                if(this.selectedData.length > 0) {
                    this.$refs.stitchPlot.plotData({
                        data: this.prepData(this.selectedData),
                        scales: this.scales,
                        colorDomain: this.$store.getters.getColorDomain,
                        fileCount: this.filesToPlot.length
                    })

                } else {
                    console.log("No data to plot...");
                    d3.select(".stitch-chart").remove();
                    this.$refs.stitchPlot.resetDefaults();

                    // Reset edit buttons to default classes
                    document.querySelector('button.brushToggle').className = 'btn btn-default brushToggle';
                    document.querySelector('button.brushToggle').innerHTML = '<i class="fa fa-square-o" aria-hidden="true"></i> Toggle brush';

                    document.querySelector('button.zoomToggle').className = 'btn btn-default zoomToggle';
                    document.querySelector('button.zoomToggle').innerHTML = '<i class="fa fa-search-plus" aria-hidden="true"></i> Toggle Zoom';
                    // d3.select("tooltip.stitch").remove();
                }
            })
        }
    },
    watch: {
        scales: {
            handler() {
            this.setParameters();
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
                    // d3.select(".tooltip-stitch").remove();

                    // Reset disable to default 'true'
                    this.disable = true;
                    
                    // Reset X & Y Scales back to default
                    this.resetScales();
                    
                    // Reset selected data to an empty array
                    this.selectedData = [];
                    
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
</style>
