<template>
  <div id="plot-tas-col" class="col-md-10">

            <!-- Plot Panel  -->
            <v-panel PANELTITLE="TAS Plot" PANELTYPE="primary">
                <!-- Plot reset button inserted into panel heading  -->
                <v-reset-button :onClick="resetPlot" v-if="!DISABLE" slot="header-content">Reset Plot</v-reset-button>
                
                <div :id="'plot-' + ID"></div>
                <div class="metadata" v-if="METADATA">
                    <hr>
                    <h3>Metadata</h3>
                    <ul class="metadata-list">
                        <li v-for="m in METADATA">
                            {{m}}
                        </li>
                    </ul>
                </div>
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
        },
        METADATA: {
            type: Array
        }
    },
    data() {

        let tempData = _.cloneDeep(chartElements);

        // Extend onto chart elements' base data
        tempData.ID = 'TAS';

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

.metadata {
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;

    .metadata-list {
        -webkit-column-count: 3; /* Chrome, Safari, Opera */
        -moz-column-count: 3; /* Firefox */
        column-count: 3;

        word-wrap: break-word;
    }
}
</style>