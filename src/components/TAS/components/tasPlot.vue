<template>
  <div id="plot-tas-col" class="col-md-10">

    <v-panel PANELTITLE="TAS Plot" PANELTYPE="primary">
        <!-- Plot reset button inserted into panel heading  -->
        <v-reset-button :onClick="resetChart" v-if="!DISABLE" slot="header-content">Reset Chart</v-reset-button>
        
        <div :id="'chart-' + ID"></div>
        <slot></slot>
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

/* Import Chart Func Mixins */
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
import { scales } from '../../../assets/javascript/mixins/chartFuncs/scales.js';
import { chartVariables } from '../../../assets/javascript/mixins/chartFuncs/chartVariables.js';
import { resetChart } from '../../../assets/javascript/mixins/chartFuncs/resetChart.js';
import { setResponsive } from '../../../assets/javascript/mixins/chartFuncs/setResponsive.js';
import { updateLineGenerator } from '../../../assets/javascript/mixins/chartFuncs/updateLineGenerator.js';
import { initDimensions } from '../../../assets/javascript/mixins/chartFuncs/initDimensions.js';
import { addClipPath } from '../../../assets/javascript/mixins/chartFuncs/addClipPath.js';
import { addSVG } from '../../../assets/javascript/mixins/chartFuncs/addSVG.js';

/* Import local mixins */
import { drawChart } from '../mixins/drawChart.js';
import { updateChart } from '../mixins/updateChart.js';

/* Import Fitting Mixins */
import { checkError } from '../../../assets/javascript/mixins/fittings/checkError.js';
import { slider } from '../../../assets/javascript/mixins/fittings/slider.js';
import { fitLine } from '../../../assets/javascript/mixins/fittings/fitLine.js';
import { reviseFitTable } from '../../../assets/javascript/mixins/fittings/reviseFitTable.js';

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
        return {
            ID: 'TAS',
            field: {
                x: null,
                y: null,
            },
            zoom: d3.zoom().on('zoom', this.zooming),
            isMathJax: false,
            dimensions: {
                h2: undefined,
            },
            margin2: {},
            axis: {
                x2: undefined,
            },
            scale: {
                x2: undefined,
            },
            fitEquation: undefined,
            fitResults: null,
            fitData: null,
            brushObj: {
                brush: undefined,
                brushSelection: [],
                brushFile: undefined,
                brushFit: undefined,
                brushTransformation: undefined,
                prevExtent: [],
            },
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
        }
    },
    mixins: [
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
        scales,
        chartVariables,
        resetChart,
        drawChart,
        updateChart,
        setChartElements,
        initDimensions,
        setResponsive,
        updateLineGenerator,
        addClipPath,
        addSVG,
        checkError,
        slider,
        fitLine,
        reviseFitTable,
    ],
    computed: {
        isFit() {
            return this.plotParameters.fileToFit !== null && this.plotParameters.fitConfiguration.fit !== 'None';
        }
    },
    methods: {
        updateScales(s) {
            let vm = this;

            vm.changeScales(s);
            vm.updateChart(vm.dataNest);
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
        },
        zoomed(new_yScale, new_xScale) {
            let vm = this;

            // re-scale axes and grids
            vm.updateAxes(new_xScale, new_yScale);
            vm.updateGrids(new_xScale, new_yScale);

            // re-draw scatter plot;
            vm.chart.g.selectAll(".dot")
                .call(vm.updateScatter, new_xScale, new_yScale);

            // re-set line generator
            vm.updateLineGenerator(new_xScale, new_yScale);

            // re-draw line paths
            vm.chart.g.selectAll(".pointlines")
                .call(vm.updateLine);
        },
    },
    created() {
        // Listen for cofficient changes
        eventBus.$on("coefficients-updated", this.redrawFit);
    },
}
</script>

<style lang="less" scoped>
@import '../style/plot-TAS-styles.css';
</style>