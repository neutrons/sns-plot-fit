<template>
  <div id="Stitch" class="col-lg-12">
    <div class="container-fluid">
        <!-- Left Sidebar for Controls and File List  -->
        <div class="col-md-2">
            <stitch-files MAINTITLE="Files">
                <stitch-panel PANELTITLE="Get Files">
                    <ul>
                        <li v-for="f in files">{{f}}</li>
                    </ul>
                </stitch-panel>
                <stitch-panel PANELTITLE="Uploaded Files"></stitch-panel>
            </stitch-files>

            <stitch-controls MAINTITLE="Controls">

                <stitch-panel PANELTITLE="Scales">
                    <!-- Add Items to a single panel  -->
                    <stitch-scales :DISABLE="false"
                        v-on:update-scales="setScales">
                    </stitch-scales>
                </stitch-panel>

            </stitch-controls>
        </div>

        <!-- Plot Panel for Main Charting Functionality  -->
        <div class="col-md-10">
            <stitch-plot MAINTITLE="Stitch"></stitch-plot>
        </div>
    </div>
    <div>
        <h1>Practice content:</h1>
        <button class="btn btn-primary" @click="fetchData">Fetch Data</button>
        <input type="checkbox" v-model="test">
    </div>
  </div>
</template>

<script>
/* Import Packages */
import * as d3 from 'd3';
import _ from 'lodash';

/* Import Control Elements */
import Controls from '../BaseComponents/Controls/Controls.vue';

/* Import File Elements */
import Files from '../BaseComponents/Files/Files.vue';

/* Import Plot Elements */
import Plot from '../BaseComponents/Plot/Plot.vue';

/* Import Panel Component */
import Panel from '../BaseComponents/Panel.vue';
import Scales from '../BaseComponents/Scales.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

export default {
    name: 'Stitch',
    components: {
      'stitch-controls': Controls,
      'stitch-plot': Plot,
      'stitch-files': Files,
      'stitch-panel': Panel,
      'stitch-scales': Scales
    },
    data: function () {
      return {
          scales: {
              xScale: d3.scaleLinear(),
              yScale: d3.scaleLinear()
          },
          test: []
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
        return this.$store.getters.getFetched1D;
      }
    },
    methods: {
      fetchData() {
        var url = document.getElementById("urlid").getAttribute("data-urlid");
        var files = JSON.parse(url);

        var temp1D = [];
        var temp2D = [];
        var vm = this;

        for (let i = 0, len = files.length; i < len; i++) {
            var temp1DFiles = [];
            var temp2DFiles = [];

            files[i].results.forEach(function(item) {
                
                if( vm.dataType(item.url) === '1D') {
                // console.log("1D Item", {url: url, group: group, fileName: name});
                temp1DFiles.push({  id: item.id, filename: item.filename, url: item.url});

                } else if ( vm.dataType(item.url) === '2D') {
                // console.log("2D Item", {url: url, group: group, fileName: name});
                temp2DFiles.push({  id: item.id, filename: item.filename, url: item.url});

                } else {
                let errorMsg = "<strong>Error! </strong>" + item.url + " is not a supported type.<br/>Make sure the file ends in <em>'Iq.txt'</em> or <em>'Iqxy.dat'</em>";
                eventBus.$emit('error-message', errorMsg);
                }
            });
            
            if(temp1DFiles.length > 0) {
                temp1D.push({jobID: files[i].job_id,
                        jobTitle: files[i].job_title,
                        dateModified: files[i].date_modified,
                        files: temp1DFiles});
            }
            
            if(temp2DFiles.length > 0) {
                temp2D.push({jobID: files[i].job_id,
                            jobTitle: files[i].job_title,
                            dateModified: files[i].date_modified,
                            files: temp2DFiles});
            }
        
        }

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
            console.log("Scales:", this.scales);
            console.log(this.$store.getters.getYScales);
        },
        deep: true
        }
    }
  }
</script>

<style scoped>

</style>
