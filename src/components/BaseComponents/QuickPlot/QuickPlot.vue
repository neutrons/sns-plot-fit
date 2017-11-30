<template>
<div :id='"chart-preview-" + id'>

  <v-chart :id='id' :data='pickedData'></v-chart>
  <v-data-picker :id='id' :file-list='fileList' @picked='myPick'></v-data-picker>
</div>
</template>

<script>
import * as d3 from 'd3';
import _ from 'lodash';

import Chart from './Chart.vue';
import DataPicker from './DataPicker.vue';

export default {
  name: "QuickPlot",
  components: {
    'v-chart': Chart,
    'v-data-picker': DataPicker,
  },
  props: {
      id: {
        type: String,
        required: true,
      },
      uploadedFiles: {
        type: Array,
      },
      fetchedFiles: {
        type: Array,
      },
  },
  data() {
    return {
      pickedData: [],
    };
  },
  computed: {
    mergedList() {
      return this.uploadedFiles.concat(this.fetchedFiles);
    },
    filenames() {
      let fnames = [];
      
      for (let i = 0, L = this.mergedList.length; i < L; i++) {
        fnames.push(this.mergedList[i].filename);
      }

      return fnames;
    },
    urls() {
      return this.$store.getters.getURLs(this.filenames, this.id);
    },
    fileList() {
      let temp = {};
      
      this.urls.forEach(el => {
        temp[el.filename] = el;
      });

      return temp;
    },
  },
  methods: {
    myPick(d) {
      this.pickedData = _.cloneDeep(d);
    }
  },
};
</script>