<template>
<div :id='"chart-preview-" + id'>
  <div :class='{"col-sm-8": isMetadata}'>
    <v-chart :id='id' :data='pickedData'></v-chart>
    
    <component :is='dataPicker'
      :id='id'
      :file-list='fileList'
      @picked='myPick'
      @update-metadata='updateMetadata'
    ></component>
  </div>

  <div :class='{"col-sm-4": isMetadata}'>
    <v-metadata
        :metadata='metadata'
        v-if='isMetadata'
    ></v-metadata>
  </div>
</div>
</template>

<script>
import * as d3 from 'd3';
import _ from 'lodash';

import Chart from './Chart.vue';
import DataPicker1D from './DataPicker1D.vue';
import DataPickerTAS from './DataPickerTAS.vue';
import Metadata from './Metadata.vue';

export default {
  name: "QuickPlot",
  components: {
    'v-chart': Chart,
    'v-metadata': Metadata,
    DataPicker1D,
    DataPickerTAS,
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
      dataPicker: {
        type: String,
        default: 'DataPicker1D',
      },
      isMetadata: {
        type: Boolean,
        default: false,
      },
  },
  data() {
    return {
      pickedData: [],
      metadata: [],
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
    },
    updateMetadata(md) {
      this.metadata = _.cloneDeep(md);
    }
  },
};
</script>