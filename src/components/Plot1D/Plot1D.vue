<template>
  <div id="Plot1d" class="col-md-10">

            <!-- Plot Panel  -->
            <v-panel PANELTITLE="1D Plot" PANELTYPE="primary">
                <!-- Plot reset button inserted into panel heading  -->
                <!-- <button class="btn btn-success btn-xs pull-left btn-reset" @click="resetPlot" v-if="currentData.length > 0" slot="header-content">Reset Plot</button> -->
                <v-reset-button :onClick="resetPlot" v-if="!DISABLE" slot="header-content">Reset Plot</v-reset-button>
                
                <div id="plot-1D"></div>

                <!-- Fit Results Table to add fit results -->
              <div id="fit-results-table" class="table table-condensed table-responsive" v-show="SHOWTABLE && !isError">          
                    <table class="table table-bordered">
                        <caption><h4>Fit Results:</h4></caption>
                    
                        <tbody>
                        <tr>
                            <td id="fit-file"></td>
                            <td id="fit-type"></td>
                            <td id="fit-points"></td>
                            <td id="fit-range"></td>
                            <td id="fit-error"></td>
                        </tr>
                        
                            <tr>
                            <td colspan="2" class="sub-heading">Fit Configuration:</td>
                            <td colspan="2" class="sub-heading">Coefficients:</td>	
                            <td colspan="1" class="sub-heading">Note:</td>
                            </tr>
                            <tr>
                            <td colspan="2" id="fit-configs">
                            <ul>
                                    <li id="fit-damping"></li>
                                    <li id="fit-iterations"></li>
                                    <li id="fit-tolerance"></li>
                                    <li id="fit-gradient"></li>
                                </ul>
                            </td>
                            <td colspan="2" id="fit-coefficients">
                            </td>
                            <td colspan="1" id="fit-note">
                            </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </v-panel>
  </div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// Here it is being used to communicate with components in Main1D.vue and
// sending errors to App.vue
import { eventBus } from '../../assets/javascript/eventBus';

/* Import Components */
import Panel from '../BaseComponents/Panels/Panel.vue';
import ResetButton from '../BaseComponents/ResetButton.vue';

import * as _ from 'lodash';
import * as d3 from 'd3';
import $ from 'jquery';

/* Import Plot Module */
import fit1D from './fitModule.js';

export default {
    name: 'Plot1d',
    components: {
        'v-panel': Panel,
        'v-reset-button': ResetButton
    },
    props: {
        DISABLE: {
            type: Boolean,
            default: true
        },
        SHOWTABLE: {
            type: Boolean,
            default: false
        }
    },
    data: function() {
        return {
            fitEquation: null,
            plotLine: null,
            fitResults: null,
            plotParams: {},
            fitData: null,
            brushSelection: null,
            isError: false,
        }
    },
    methods: {
        plotData: fit1D.plotData,
        resetPlot: fit1D.resetPlot,
        redrawFit: fit1D.redrawFit,
        changeScales: fit1D.changeScales,
        setParameters: function(parameters) {
            // Check data is valid prior to plotting
            this.plotParams = _.cloneDeep(parameters);
        },
        resetBrushSelection: function() {
            this.brushSelection = null;
        },
        setIsError(val) {
            this.isError = val;
        }
    },
    created() {
        // Listen for cofficient changes
        eventBus.$on("coefficients-updated", this.redrawFit);

        eventBus.$on('set-is-error', this.setIsError);
    },
    watch: {
        plotParams: {
            handler: function() {
                let vm = this;

                this.$nextTick(function() { this.plotData(this.plotParams, vm);});
            },
            deep: true
        }
    }
}
</script>

<style scoped>
@import '../../assets/styles/plot-1D-styles.css';

#selection-error {
    position: absolute;
    top: 0;
    width: 100%;
}
</style>