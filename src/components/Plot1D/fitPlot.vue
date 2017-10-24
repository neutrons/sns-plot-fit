<template>
  <div id="plot-1d-col" class="col-md-10">

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

/* Import Mixins */
import { brushed } from './mixins/brushed.js';
import { checkError } from './mixins/checkError.js';
import { initDimensions } from './mixins/initDimensions.js';
import { initFitLine } from './mixins/initFitLine.js';
import { initSlider } from './mixins/initSlider.js';
import { redrawFit } from './mixins/redrawFit.js';
import { updateFitLine } from './mixins/updateFitLine.js';
import { updateSlider } from './mixins/updateSlider.js';
import { drawPlot } from './mixins/drawPlot.js';
import { resetPlot } from '../../assets/javascript/mixins/chart/resetPlot.js';
import { adjustDomains } from '../../assets/javascript/mixins/chart/adjustDomains.js';
import { changeScales } from '../../assets/javascript/mixins/chart/changeScales.js';
import { setResponsive } from '../../assets/javascript/mixins/chart/setResponsive.js';
import { updateData } from '../../assets/javascript/mixins/chart/updateData.js';
import { updateLegend } from '../../assets/javascript/mixins/chart/updateLegend.js';
import { zoomed } from '../../assets/javascript/mixins/chart/zoomed.js';
import { removePointExtend } from './mixins/removePointExtend.js';
import { removePoint } from '../../assets/javascript/mixins/chart/removePoint.js';
import { initScales } from '../../assets/javascript/mixins/chart/initScales.js';
import { setElements } from '../../assets/javascript/mixins/chart/setElements.js';
import { removeLines } from '../../assets/javascript/mixins/chart/removeLines.js';
import { updatePlot } from '../../assets/javascript/mixins/chart/updatePlot.js';
import { updateLabels } from '../../assets/javascript/mixins/chart/updateLabels.js';

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
    data() {

        let tempData = _.cloneDeep(chartElements);

        // Extend onto chart elements' base data
        tempData.elements.slider = undefined;
        tempData.elements.fitline = undefined;
        tempData.dimensions.h2 = undefined;
        tempData.margin2 = {};
        tempData.axis.x2 = undefined;
        tempData.scale.x2 = undefined;
        tempData.fitEquation = undefined;
        tempData.fitResults = null;
        tempData.fitData = null;
        tempData.brushObj = {
            brush: undefined,
            brushSelection: [],
            brushFile: undefined,
            brushFit: undefined,
            brushTransformation: undefined
        };
        tempData.ID = '1D';
        tempData.dataToFit = undefined;
        tempData.selLimits = [];
        tempData.dataToFit = undefined;
        tempData.isError = false;
        tempData.coefficients = undefined;
        tempData.fitError = undefined;
        tempData.fitResults = undefined;
        tempData.fitLineData = [];
        tempData.prevFit = null;
        tempData.prevTransform = undefined;

        tempData.zoom = d3.zoom().on("zoom", this.zooming);

        return tempData;

    },
    computed: {
        isFit() {
            return this.plotParameters.fileToFit !== null && this.plotParameters.fitConfiguration.fit !== 'None';
        }
    },
    mixins: [ 
        brushed,
        checkError,
        initDimensions,
        initFitLine,
        initSlider,
        redrawFit,
        resetPlot,
        updateFitLine,
        updateSlider,
        updateLabels,
        adjustDomains,
        changeScales,
        setResponsive,
        updateData,
        updateLegend,
        zoomed,
        removePoint,
        removePointExtend,
        initScales,
        setElements,
        removeLines,
        updatePlot,
        drawPlot
    ],
    methods: {
        setParameters: function(parameters) {
            // Check data is valid prior to plotting
            this.plotParameters = _.cloneDeep(parameters);
        },
        updateScales(s) {
            let vm = this;

            vm.changeScales(s);
            
            // if theres a fit, update brush scale
            if (vm.isFit) {
                vm.scale.x2 = s.xScale.copy();
                vm.scale.x2.range([0, vm.dimensions.w]);
            }
            
            vm.updatePlot(vm.dataNest);
            // if a fit is selected add/update data
            if (vm.isFit) { vm.updateSlider(); vm.updateFitLine(); }
        },
        zooming() {
            let vm = this;

            // Update scales
            let new_yScale = d3.event.transform.rescaleY(vm.scale.y);
            let new_xScale = d3.event.transform.rescaleX(vm.scale.x);

            // Now call re-usable part of zoom
            vm.zoomed(new_yScale, new_xScale);
            
            if (vm.isFit) {
                // Re-draw fitted line
                vm.elements.plot.select(".fitted-line")
                    .attr("d", vm.line);
            }
        }
    },
    created() {
        // Listen for cofficient changes
        eventBus.$on("coefficients-updated", this.redrawFit);
    },
    watch: {
        plotParameters: {
            handler: function() {
                let vm = this;

                this.$nextTick(function() { 
                    this.drawPlot();
                });
            },
            deep: true
        }
    }
}
</script>

<style lang="less" scoped>
@import '../../assets/styles/plot-1D-styles.css';

#selection-error {
    position: absolute;
    top: 0;
    width: 100%;
}
</style>