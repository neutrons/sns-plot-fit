<template>
  <div id="New1D" class="col-lg-12">
      <div class="container-fluid">
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
                                <tr v-for="f in fetchFiles">
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
      </div>

      <div class="col-lg-10">
        <v-panel PANELTITLE="1D Plot" PANELTYPE="primary">
            Plot will go here.
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

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../assets/javascript/eventBus';

export default {
    components: {
      'v-panel-group': PanelGroup,
      'v-panel': Panel,
      'v-table': Table,
      'v-filter': Filter
    },
    data: function () {
      return {
        filterBy: 'All',
        sortBy: 'ascending'
      }
    },
    computed: {
      fetchFiles() {
        
        var temp = _.cloneDeep(this.$store.getters.getFetched1D);
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
#New1D {
  position: absolute;
  left: 0;
  right: 0;  
}
</style>
