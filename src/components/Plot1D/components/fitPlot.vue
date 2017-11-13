<template>
  <div id="plot-1d-col" class="col-md-10">

            <!-- Plot Panel  -->
            <v-panel PANELTITLE="SANS 1D Plot" PANELTYPE="primary">
                <!-- Plot reset button inserted into panel heading  -->
                <v-reset-button :onClick="resetChart" v-if="!DISABLE" slot="header-content">Reset Chart</v-reset-button>
                
                <div :id="'chart-' + ID"></div>

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
import { eventBus } from '../../../assets/javascript/eventBus';

/* Import Components */
import Panel from '../../BaseComponents/Panels/Panel.vue';
import ResetButton from '../../BaseComponents/ResetButton.vue';

/* Import Libraries */
import * as _ from 'lodash';
import * as d3 from 'd3';
import $ from 'jquery';

/* Import Local Mixins */
import { checkError } from '../mixins/checkError.js';
import { drawChart } from '../mixins/drawChart.js';
import { slider } from '../mixins/slider.js';
import { fitLine } from '../mixins/fitLine.js';
import { reviseFitTable } from '../mixins/reviseFitTable.js';


/* Import Chart Func Mixins */
import { chartVariables } from '../../../assets/javascript/mixins/chartFuncs/chartVariables.js';
import { setChartElements } from '../../../assets/javascript/mixins/chartFuncs/setChartElements.js';
import { removePoint } from '../../../assets/javascript/mixins/chartFuncs/removePoint.js';
import { removeElements } from '../../../assets/javascript/mixins/chartFuncs/removeElements.js';
import { labels } from '../../../assets/javascript/mixins/chartFuncs/labels.js';
import { adjustDomains } from '../../../assets/javascript/mixins/chartFuncs/adjustDomains.js';
import { axes } from '../../../assets/javascript/mixins/chartFuncs/axes.js';
import { grids } from '../../../assets/javascript/mixins/chartFuncs/grids.js';
import { color } from '../../../assets/javascript/mixins/chartFuncs/color.js';
import { legend } from '../../../assets/javascript/mixins/chartFuncs/legend.js';
import { linePath } from '../../../assets/javascript/mixins/chartFuncs/linePath.js';
import { scatter } from '../../../assets/javascript/mixins/chartFuncs/scatter.js';
import { errorBars } from '../../../assets/javascript/mixins/chartFuncs/errorBars.js';
import { scales } from '../../../assets/javascript/mixins/chartFuncs/scales.js';
import { resetChart } from '../../../assets/javascript/mixins/chartFuncs/resetChart.js';
import { setResponsive } from '../../../assets/javascript/mixins/chartFuncs/setResponsive.js';
import { zoom } from '../../../assets/javascript/mixins/chartFuncs/zoom.js';
import { updateChart } from '../../../assets/javascript/mixins/chartFuncs/updateChart.js';
import { updateLineGenerator } from '../../../assets/javascript/mixins/chartFuncs/updateLineGenerator.js';
import { initDimensions } from '../../../assets/javascript/mixins/chartFuncs/initDimensions.js';
import { addClipPath } from '../../../assets/javascript/mixins/chartFuncs/addClipPath.js';
import { addSVG } from '../../../assets/javascript/mixins/chartFuncs/addSVG.js';

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
        return {
            dimensions: {
                h2: undefined
            },
            margin2: {},
            axis: {
                x2: undefined
            },
            scale: {
                x2: undefined
            },
            fitEquation: undefined,
            fitResults: null,
            fitData: null,
            brushObj: {
                brush: undefined,
                brushSelection: [],
                brushFile: undefined,
                brushFit: undefined,
                brushTransformation: undefined
            },
            ID: 'SANS1D',
            dataToFit: undefined,
            selLimits: [],
            dataToFit: undefined,
            isError: false,
            coefficients: undefined,
            fitError: undefined,
            fitResults: undefined,
            fitLineData: [],
            prevFit: null,
            prevTransform: undefined,
            isMathJax: true,
            zoom: d3.zoom().on("zoom", this.zooming),
        }

    },
    computed: {
        isFit() {
            return this.plotParameters.fileToFit !== null && this.plotParameters.fitConfiguration.fit !== 'None';
        }
    },
    mixins: [
        reviseFitTable,
        checkError,
        initDimensions,
        drawChart,
        slider,
        fitLine,
        chartVariables,
        setChartElements,
        removePoint,
        removeElements,
        labels,
        adjustDomains,
        axes,
        grids,
        color,
        legend,
        linePath,
        scatter,
        errorBars,
        scales,
        resetChart,
        setResponsive,
        zoom,
        updateChart,
        updateLineGenerator,
        addClipPath,
        addSVG
    ],
    methods: {
        setParameters(parameters) {
            // Check data is valid prior to plotting
            this.plotParameters = _.cloneDeep(parameters);
        },
        updateScales(s) {
            let vm = this;

            vm.changeScales(s);
            
            // if theres a fit, update brush scale
            if (vm.isFit) {
                vm.scale.x2 = s.x.copy();
                vm.scale.x2.range([0, vm.dimensions.w]);
            }
            
            vm.updateChart(vm.dataNest);
            
            // if a fit is selected add/update data
            if (vm.isFit) { 
                vm.updateSlider(); 
                vm.updateFitLine(); 
            }
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
                vm.chart.g.select(".fitted-line")
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
            handler() {
                let vm = this;

                this.$nextTick(function() { 
                    this.drawChart();
                });
            },
            deep: true
        }
    }
}
</script>

<style lang="less" scoped>
@import '../style/plot-1D-styles.css';

#selection-error {
    position: absolute;
    top: 0;
    width: 100%;
}
</style>