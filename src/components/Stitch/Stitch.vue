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
                        <v-table :fieldNames="['Fit', 'Plot', 'Filename', 'Group']">
                            <template>
                                <tr v-for="f in fetchFiles('1D', sortBy, filterBy)">
                                    <template>
                                        <td><input type="checkbox"></td>
                                        <td><input type="checkbox"></td>
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
                     <v-table :fieldNames="['Fit', 'Plot', 'Filename', 'Delete']">
                            <template>
                                <tr v-for="f in uploadFiles">
                                    <template>
                                        <td><input type="checkbox"></td>
                                        <td><input type="checkbox"></td>
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
                        :DISABLE="false"
                        @update-scales="setScales">
                    </v-scales>
                </v-panel>

            </v-panel-group>
        </div>

        <!-- Plot Panel for Main Charting Functionality  -->
        <div class="col-lg-10">
            <!-- <v-plot MAINTITLE="Stitch"></v-plot> -->
            <v-panel PANELTITLE="Stitch Plot" PANELTYPE="primary">
                Plot content will go here.
            </v-panel>
        </div>
    </div>
    <!-- <div>
        <h1>Practice content:</h1>
        <button class="btn btn-primary" @click="fetchData">Fetch Data</button>
        <li><label class="btn btn-primary navbar-btn"><i class="fa fa-file" aria-hidden="true"></i> Load Files <input id="file-upload" type="file" style="display: none;" @change="uploadFile($event.target.files)" multiple></label></li>
        <div class="row">
            <div class="col-lg-2">
                Side panel
            </div>
            <div class="col-lg-10">
                Some stuff
            </div>
        </div>
    </div> -->
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

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

/* Import Mixins */
import { fetchFiles } from '../../assets/javascript/mixins/fetchFiles.js';

export default {
    name: 'Stitch',
    components: {
      'v-panel-group': PanelGroup,
      'v-panel': Panel,
      'v-scales': Scales,
      'v-table': Table,
      'v-filter': TableFilter
    },
    data: function () {
      return {
          scales: {
              xScale: d3.scaleLinear(),
              yScale: d3.scaleLinear(),
          },
          filterBy: 'All',
          sortBy: 'ascending'
      }
    },
    mixins: [fetchFiles],
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
        setScales(xscale, yscale) {
            this.scales.xScale = this.$store.getters.getXScaleByID(xscale);
            this.scales.yScale = this.$store.getters.getYScaleByID(yscale);
        }
        },
    watch: {
        scales: {
            handler: function() {
            
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
