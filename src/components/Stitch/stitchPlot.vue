<template>
  <div id="plot-stitch-col" class="col-md-10">

            <!-- Plot Panel  -->
            <v-panel PANELTITLE="Stitch Plot" PANELTYPE="primary">
                <!-- Plot reset button inserted into panel heading  -->
                <!-- <button class="btn btn-success btn-xs pull-left btn-reset" @click="resetPlot" v-if="currentData.length > 0" slot="header-content">Reset Plot</button> -->
                <v-reset-button :onClick="resetPlot" v-if="!DISABLE" slot="header-content">Reset Plot</v-reset-button>
                
                <!-- <button class="btn btn-primary" @click="removeBrushes">Remove Brushes</button> -->
                <div id="plot-stitch"></div>
                  
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
import Panel from '../BaseComponents/Panels/Panel.vue';
import ResetButton from '../BaseComponents/ResetButton.vue';

/* Import Default Chart Elements */
import chartElements from '../../assets/javascript/mixins/chart/chartElements.js';

/* Import Mixins */
import { newBrush, drawBrushes, removeBrushes, sortBrushes, drawSavedBrushes} from './mixins/createBrushes.js';
import { updateBrushScale } from './mixins/updateBrushScale.js';
import { formatData } from './mixins/formatData.js';
import { saveStitchLine, saveConfirm, isValidFilename } from './mixins/saveStitchLine.js';
import { stitchData, addStitch, removeStitchLine, selectData } from './mixins/stitchData.js';
import { updateStitchLine } from './mixins/updateStitchLine.js';
import { toggleEdit, resetToggle} from './mixins/toggleEdit.js';
import { validateBrushes, validateSelections } from './mixins/validateBrushes.js';
import { initDimensions } from './mixins/initDimensions.js';
import { drawPlot } from './mixins/drawPlot.js';
import { removePointExtend } from './mixins/removePointExtend.js';

import { removePoint } from '../../assets/javascript/mixins/chart/removePoint.js';
import { resetPlot } from '../../assets/javascript/mixins/chart/resetPlot.js';
import { adjustDomains } from '../../assets/javascript/mixins/chart/adjustDomains.js';
import { changeScales } from '../../assets/javascript/mixins/chart/changeScales.js';
import { setResponsive } from '../../assets/javascript/mixins/chart/setResponsive.js';
import { updateData } from '../../assets/javascript/mixins/chart/updateData.js';
import { updateLegend } from '../../assets/javascript/mixins/chart/updateLegend.js';
import { zoomed } from '../../assets/javascript/mixins/chart/zoomed.js';
import { initScales } from '../../assets/javascript/mixins/chart/initScales.js';
import { setElements } from '../../assets/javascript/mixins/chart/setElements.js';
import { removeLines } from '../../assets/javascript/mixins/chart/removeLines.js';
import { updatePlot } from '../../assets/javascript/mixins/chart/updatePlot.js';
import { updateLabels } from '../../assets/javascript/mixins/chart/updateLabels.js';

export default {
    name: 'StitchPlot',
    components: {
        'v-panel': Panel,
        'v-reset-button': ResetButton
    },
    data() {

        let tempData = _.cloneDeep(chartElements);

        // Extend conto chart elements' base data
        tempData.scale.brushX = undefined;
        tempData.elements.stitch = undefined;
        tempData.margin = { top: 20, bottom: 55, left: 50, right: 25 };
        tempData.brushObj = {
            brushes: [],
            brushCount: null,
            brushSelections: {},
            brushGroup: undefined
        };
        tempData.stitchLineData = [];
        tempData.savedSelections = {};
        tempData.savedBrushes = [];
        tempData.ID = 'stitch';

        tempData.isError = false;
        tempData.isError = false;
        tempData.zoomEnabled = false;
        tempData.brushEnabled = false;
        tempData.brushExtent = [];
        tempData.brushSelection = null;
        tempData.toggleChoice = 'zoom';

        tempData.zoom = d3.zoom().on("zoom", this.zooming);
        
        return tempData;
    },
    props: {
        DISABLE: {
            type: Boolean,
            default: true
        }    
    },
    mixins: [
        newBrush,
        drawBrushes,
        removeBrushes,
        sortBrushes,
        drawSavedBrushes,
        updateBrushScale,
        formatData,
        saveStitchLine,
        saveConfirm,
        isValidFilename,
        stitchData,
        addStitch,
        removeStitchLine,
        selectData,
        updateStitchLine,
        toggleEdit,
        resetToggle,
        validateBrushes,
        validateSelections,
        initDimensions,
        resetPlot,
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
        updateLabels,
        drawPlot
    ],
    computed: {
        selections() {
            return this.brushObj.brushSelections;
        },
        isBrushes() {
            let vm = this;

            return Object.keys(vm.selections).length > 0;
        }
    },
    methods: {
        setParameters: function(parameters) {
            // Check data is valid prior to plotting
            this.plotParameters = _.cloneDeep(parameters);
        },
        updateScales(s) {
            let vm = this;
            vm.changeScales(s);
            vm.updatePlot(vm.dataNest);

            // If there are brushes, re-adjust selections according to new scale
            // Update brushScale to reflect new zoomed scale
            vm.scale.brushX = vm.scale.x.copy();

            if (Object.keys(vm.brushObj.brushSelections).length > 0) {
                
                vm.brushObj.brushSelections = _.mapValues(vm.brushObj.brushSelections, function(el) {
                    return {
                        raw: el.raw,
                        converted: el.raw.map(i => vm.scale.brushX.invert(i))
                    }
                });
            }

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
            if (Object.keys(vm.brushObj.brushSelections).length > 0) {
                
                vm.brushObj.brushSelections = _.mapValues(vm.brushObj.brushSelections, function(el) {
                    return {
                        raw: el.raw,
                        converted: el.raw.map(i => vm.scale.brushX.invert(i))
                    }
                });
            }

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
            handler: function() {
                let vm = this;

                this.$nextTick(function() { 
                    vm.drawPlot();
                });
            },
            deep: true
        }
    }
}
</script>

<style scoped>
/* Anything that needs changing gets overidden here */
@import '../../assets/styles/plot-stitch-styles.css';
</style>