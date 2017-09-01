<template>
  <div id="Stitch" class="col-lg-12">
    <div class="container-fluid">
        <!-- Left Sidebar for Controls and File List  -->
        <div class="col-lg-2">
            <v-panel-group MAINTITLE="Files" PANELTYPE="primary">
                <v-panel PANELTITLE="Fetched Data" PANELTYPE="success">
                    <div>
                        <v-filter 
                            @filter-job="filterJob"
                            @sort-by-date="sortByDate"
                        ></v-filter>
                    </div>
                    <v-table :fieldNames="['Fit', 'Plot', 'Filename', 'Group']" v-show="files.length > 0">
                        <template>
                            <tr v-for="f in files">
                                <template>
                                    <td><input type="checkbox"></td>
                                    <td><input type="checkbox"></td>
                                    <td>{{f.filename}}</td>
                                    <td>{{f.jobTitle}}</td>
                                </template>
                            </tr>
                        </template>
                    </v-table>

                </v-panel>
                <v-panel PANELTITLE="Uploaded Data" PANELTYPE="success"></v-panel>
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
    <div>
        <h1>Practice content:</h1>
        <button class="btn btn-primary" @click="fetchData">Fetch Data</button>
        <div class="row">
            <div class="col-lg-2">
                Side panel
            </div>
            <div class="col-lg-10">
                Some stuff
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

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

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
    computed: {
      xScales() {
        return this.$store.getters.getXScales;
      },
      yScales() {
        return this.$store.getters.getYScales;
      },
      files() {
        
        var temp = this.$store.getters.getFetched1D;
        console.log("Sorting by: " + this.sortBy);
        if(this.sortBy === 'ascending') {
            if(this.filterBy === 'All') {
                return temp.sort(function(a,b) { return new Date(a.dateModified) - new Date(b.dateModified); });
            } else {
                return temp.filter(el => el.jobTitle === this.filterBy)
                    .sort(function(a,b) { return new Date(a.dateModified) - new Date(b.dateModified); });
            }
        } else {
            if(this.filterBy === 'All') {
                return temp.sort(function(a,b) { return new Date(b.dateModified) - new Date(a.dateModified); });
            } else {
                return temp.filter(el => el.jobTitle === this.filterBy)
                    .sort(function(a,b) { return new Date(b.dateModified) - new Date(a.dateModified); });
            }
        }
      }
    },
    methods: {
        filterJob(filter) {
            this.filterBy = filter;
        },
        sortByDate(direction) {
            this.sortBy = direction;
        },
      fetchData() {
        var url = document.getElementById("urlid").getAttribute("data-urlid");
        var files = JSON.parse(url);

        var temp1D = [];
        var temp2D = [];
        var vm = this;

        for (let i = 0, len = files.length; i < len; i++) {
            var temp1DFiles = [];
            var temp2DFiles = [];
            var jobTitle = files[i].job_title;
            var jobModified = files[i].date_modified;

            files[i].results.forEach(function(item) {
                
                if( vm.dataType(item.url) === '1D') {
                // console.log("1D Item", {url: url, group: group, fileName: name});
                temp1D.push({  id: item.id, filename: item.filename, url: item.url, jobTitle: jobTitle, dateModified: jobModified });

                } else if ( vm.dataType(item.url) === '2D') {
                // console.log("2D Item", {url: url, group: group, fileName: name});
                temp2D.push({  id: item.id, filename: item.filename, url: item.url, jobTitle: jobTitle, dateModified: jobModified });

                } else {
                let errorMsg = "<strong>Error! </strong>" + item.url + " is not a supported type.<br/>Make sure the file ends in <em>'Iq.txt'</em> or <em>'Iqxy.dat'</em>";
                eventBus.$emit('error-message', errorMsg);
                }
            });
        
        }
        console.log("Files", temp1D, temp2D);
        // Add Fetched File List(s) to Global Store
        if(temp1D.length > 0) this.$store.commit('addFetched1DFiles', temp1D);
        if(temp2D.length > 0) this.$store.commit('addFetched2DFiles', temp2D);  
    },
    dataType(fname) {
      if (/.*Iq.txt$/.exec(fname)) {
        // File matches 1D data
        return '1D';
      } else if (/.*.dat$/.exec(fname)) {
        // File matches for 2D data
        return '2D';
      } else {
        // File doesn't match for either 1D or 2D, throw error message
        return false;
      }
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
        },
        filterBy: function() {
            console.log("Filter changed: " + this.filterBy);
        },
        sortBy: function() {
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
