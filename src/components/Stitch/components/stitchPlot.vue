<template>
<div id="plot-stitch-col" class="col-md-8">

  <!-- Plot Panel  -->
  <v-panel PANELTITLE="Stitch Plot" PANELTYPE="primary">
    <!-- Plot reset button inserted into panel heading  -->
    <v-reset-button :onClick="resetChart" v-if="!DISABLE" slot="header-content">Reset Chart</v-reset-button>

    <div :id="'chart-' + ID"></div>

    <!-- Fit Results Table to add fit results -->
    <div id="brush-selection-table" class="table table-condensed table-responsive" v-if="isBrushes">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Selections</th>
            <th>X-Min</th>
            <th>X-Max</th>
          </tr>
        </thead>

        <tbody>

          <tr v-for="(value, key) in selections">
            <td>{{key}}</td>
            <td>{{value.converted[0].toExponential(4)}}</td>
            <td>{{value.converted[1].toExponential(4)}}</td>
          </tr>

        </tbody>
      </table>
    </div>
  </v-panel>
</div>
</template>

<script>
/* Import libraries */
import * as d3 from 'd3';

/* Import Components */
import Panel from '../../BaseComponents/Panels/Panel.vue';
import ResetButton from '../../BaseComponents/ResetButton.vue';

/* Import Local Mixins */
import { brush } from '../mixins/brush.js';
import { formatData } from '../mixins/formatData.js';
import { stitchline } from '../mixins/stitchline.js';
import { toggleZoomBrush } from '../mixins/toggleZoomBrush.js';
import { validate } from '../mixins/validate.js';
import { drawChart } from '../mixins/drawChart.js';

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
    name: 'StitchPlot',
    components: {
        'v-panel': Panel,
        'v-reset-button': ResetButton
    },
    data() {
        return {
            scale: {
                brushX: undefined
            },
            margin: { top: 20, bottom: 55, left: 50, right: 25 },
            brushObj: {
                brushes: [],
                brushCount: null,
                brushSelections: {},
                brushGroup: undefined
            },
            stitchLineData: [],
            savedSelections: {},
            savedBrushes: [],
            ID: 'Stitch',
            isError: false,
            isError: false,
            zoomEnabled: false,
            brushEnabled: false,
            brushExtent: [],
            brushSelection: null,
            toggleChoice: 'zoom',
            isMathJax: false,
            zoom: d3.zoom().on("zoom", this.zooming),
        }
    },
    props: {
        DISABLE: {
            type: Boolean,
            default: true
        }    
    },
    mixins: [
        brush,
        formatData,
        stitchline,
        toggleZoomBrush,
        validate,
        initDimensions,
        drawChart,
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
        scales,
        resetChart,
        setResponsive,
        zoom,
        updateChart,
        errorBars,
        updateLineGenerator,
        addClipPath,
        addSVG
    ],
    computed: {
        selections() {
            return this.brushObj.brushSelections;
        },
        isBrushes() {
            let vm = this;

            return Object.keys(vm.selections).length > 0;
        },
        brushSelectionLength() {
            let vm = this;

            return Object.keys(vm.brushObj.brushSelections).length > 0;
        }
    },
    methods: {
        setParameters(parameters) {
            // Check data is valid prior to plotting
            this.plotParameters = _.cloneDeep(parameters);
        },
        reconvertBrushSelections() {
            let vm = this;
            
            vm.brushObj.brushSelections = _.mapValues(vm.brushObj.brushSelections, function(el) {
                    return {
                        raw: el.raw,
                        converted: el.raw.map(i => vm.scale.brushX.invert(i))
                    }
                });            
        },
        updateScales(s) {
            let vm = this;
            vm.changeScales(s);
            vm.updateChart(vm.dataNest);

            // If there are brushes, re-adjust selections according to new scale
            // Update brushScale to reflect new zoomed scale
            vm.scale.brushX = vm.scale.x.copy();

            if (vm.brushSelectionLength)    vm.reconvertBrushSelections();

            vm.updateStitchLine();
        },
        zooming() {
            let vm = this;

            // Update Scales
            let new_yScale = d3.event.transform.rescaleY(vm.scale.y);
            let new_xScale = d3.event.transform.rescaleX(vm.scale.x);

            // Update brushScale to reflect new zoomed scale
            vm.scale.brushX = new_xScale.copy();

            // If there are brushes, re-adjust selections according to new scale
           if (vm.brushSelectionLength)    vm.reconvertBrushSelections();

            // Now call re-usable part of zoom
            vm.zoomed(new_yScale, new_xScale);
        },
        checkError() {
            let len = document.getElementById("error-container").children.length;
            return len > 0 ? false : true;
        },
        resetDefaults() {
            this.brushXScale = null;
            this.zoomEnabled = false;
            this.brushEnabled = false;
            this.brushObj.brushSelections = {};
            this.brushObj.brushes = [];
            this.resetToggle();
        }
    },
    watch: {
        plotParameters: {
            handler() {
                let vm = this;

                this.$nextTick(function() { 
                    vm.drawChart();
                });
            },
            deep: true
        }
    }
}
</script>

<style scoped>
/* Anything that needs changing gets overidden here */
@import '../style/plot-stitch-styles.css';
</style>