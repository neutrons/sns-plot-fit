<template>
  <div id="plot-tas-col" class="col-md-10">

    <v-panel PANELTITLE="TAS Plot" PANELTYPE="primary">
        <!-- Plot reset button inserted into panel heading  -->
        <v-reset-button :onClick="resetPlot" v-if="!DISABLE" slot="header-content">Reset Plot</v-reset-button>
        
        <div :id="'plot-' + ID"></div>
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

/* Import Common Data Variables */
import chartElements from '../../../assets/javascript/mixins/chart/chartElements.js';

/* Import Mixins */
import { setElements } from '../../../assets/javascript/mixins/chart/setElements.js';
import { resetPlot } from '../../../assets/javascript/mixins/chart/resetPlot.js';
import { setResponsive } from '../../../assets/javascript/mixins/chart/setResponsive.js';
import setLineGenerator from '../../../assets/javascript/mixins/chart/setLineGenerator.js';
import { addLabels } from '../../../assets/javascript/mixins/chart/addLabels.js';
import { adjustDomains } from '../../../assets/javascript/mixins/chart/adjustDomains.js';
import { changeScales } from '../../../assets/javascript/mixins/chart/changeScales.js';
import { updateLegend } from '../../../assets/javascript/mixins/chart/updateLegend.js';
import { initScales } from '../../../assets/javascript/mixins/chart/initScales.js';
import { updateLabels } from '../../../assets/javascript/mixins/chart/updateLabels.js';
import { removeLines } from '../../../assets/javascript/mixins/chart/removeLines.js';
import { removePoint } from '../../../assets/javascript/mixins/chart/removePoint.js';

/* Import local mixins */
import { drawPlot } from '../mixins/drawPlot.js';
import { updatePlot } from '../mixins/updatePlot.js';
import { initDimensions } from '../mixins/initDimensions.js';

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
        tempData.ID = 'TAS';
        tempData.fields = {x: null, y: null};
        tempData.zoom = d3.zoom().on("zoom", this.zooming);
        tempData.isMathJax = false;

        return tempData;

    },
    computed: {
        isFit() {
            return this.plotParameters.fileToFit !== null && this.plotParameters.fitConfiguration.fit !== 'None';
        }
    },
    mixins: [
        setElements,
        setResponsive,
        resetPlot,
        drawPlot,
        updatePlot,
        initScales,
        adjustDomains,
        initDimensions,
        changeScales,
        updateLegend,
        updateLabels,
        addLabels,
        removeLines,
        removePoint
    ],
    methods: {
        updateScales(s) {
            let vm = this;

            vm.changeScales(s);
            vm.updatePlot(vm.dataNest);
        },
        zooming() {
            let vm = this;

            // Update scales
            let new_yScale = d3.event.transform.rescaleY(vm.scale.y);
            let new_xScale = d3.event.transform.rescaleX(vm.scale.x);

            // Now call re-usable part of zoom
            vm.zoomed(new_yScale, new_xScale);
        },
        zoomed(new_yScale, new_xScale) {
            let vm = this;

            // re-set line generator
            setLineGenerator(vm, new_xScale, new_yScale);

            // re-scale axes and gridlines during zoom
            vm.elements.axis.select(".axis--y").transition()
                .duration(50)
                .call(vm.axis.y.scale(new_yScale));

            vm.elements.axis.select(".axis--x").transition()
                .duration(50)
                .call(vm.axis.x.scale(new_xScale));

            vm.elements.axis.select(".gridline--y")
                .call(vm.axis.yGrid.scale(new_yScale));
            
            vm.elements.axis.select(".gridline--x")
                .call(vm.axis.xGrid.scale(new_xScale));

            // re-draw scatter plot;
            vm.elements.plot.selectAll("circle")
                .attr("cy", function (d) {
                    return new_yScale(d.y);
                })
                .attr("cx", function (d) {
                    return new_xScale(d.x);
                });           

            vm.elements.plot.selectAll(".pointlines")
                .attr("d", vm.line);
        }
    }
}
</script>

<style lang="less" scoped>
@import '../style/plot-TAS-styles.css';
</style>