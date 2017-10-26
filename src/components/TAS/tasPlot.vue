<template>
  <div id="plot-tas-col" class="col-md-10">

            <!-- Plot Panel  -->
            <v-panel PANELTITLE="TAS Plot" PANELTYPE="primary">
                <!-- Plot reset button inserted into panel heading  -->
                <!-- <button class="btn btn-success btn-xs pull-left btn-reset" @click="resetPlot" v-if="currentData.length > 0" slot="header-content">Reset Plot</button> -->
                <v-reset-button :onClick="resetPlot" v-if="!DISABLE" slot="header-content">Reset Plot</v-reset-button>
                
                <div :id="'plot-' + ID"></div>
            </v-panel>
  </div>
</template>

<script>
/* Import Event Bus */
import { eventBus } from '../../assets/javascript/eventBus';

/* Import Components */
import Panel from '../BaseComponents/Panels/Panel.vue';
import ResetButton from '../BaseComponents/ResetButton.vue';

/* Import Libraries */
import * as _ from 'lodash';
import * as d3 from 'd3';
import $ from 'jquery';

/* Import Common Data Variables */
import chartElements from '../../assets/javascript/mixins/chart/chartElements.js';

export default {
    name: 'PlotTAS',
    components: {
        'v-panel': Panel,
        'v-reset-button': ResetButton
    },
    props: {
        DISABLE: {
            type: Boolean,
            default: true
        }
    },
    data() {

        let tempData = _.cloneDeep(chartElements);

        // Extend onto chart elements' base data
        tempData.ID = '1D';

        return tempData;

    },
    computed: {
        isFit() {
            return this.plotParameters.fileToFit !== null && this.plotParameters.fitConfiguration.fit !== 'None';
        }
    },
    mixins: [],
    methods: {},
    created() {},
    watch: {
        plotParameters: {
            handler() {
                // let vm = this;

                // this.$nextTick(function() { 
                //     this.drawPlot();
                // });
            },
            deep: true
        }
    }
}
</script>

<style lang="less" scoped>
@import '../../assets/styles/plot-TAS-styles.css';
</style>