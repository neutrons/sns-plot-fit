<template>
<div :id='"chart-preview-" + id' class='row'>
  <div :class='isMetadata ? "col-sm-8" : ""'>
    <v-chart :data='pickedData'></v-chart>
    
    <component :is='dataPicker'
      @picked='myPick'
      @update-metadata='updateMetadata'
    ></component>
  </div>

  <div :class='isMetadata ? "col-sm-4" : ""'>
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
    id() {
      return this.$route.name;
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