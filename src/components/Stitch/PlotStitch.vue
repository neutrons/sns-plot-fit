<template>
  <div id="plot-stitch-col" class="col-md-10">

            <!-- Plot Panel  -->
            <v-panel PANELTITLE="Stitch Plot" PANELTYPE="primary">
                <!-- Plot reset button inserted into panel heading  -->
                <!-- <button class="btn btn-success btn-xs pull-left btn-reset" @click="resetPlot" v-if="currentData.length > 0" slot="header-content">Reset Plot</button> -->
                <v-reset-button :onClick="resetPlot" v-if="!DISABLE" slot="header-content">Reset Plot</v-reset-button>
                
                <!-- <button class="btn btn-primary" @click="removeBrushes">Remove Brushes</button> -->
                <div id="stitch-plot"></div>
            </v-panel>
  </div>
</template>

<script>
/* Import libraries */
import * as d3 from 'd3';

/* Import Components */
import Panel from '../BaseComponents/Panels/Panel.vue';
import ResetButton from '../BaseComponents/ResetButton.vue';

/* Import Stitch Module */
import stitch from './stitchModule.js';

export default {
    name: 'StitchPlot',
    components: {
        'v-panel': Panel,
        'v-reset-button': ResetButton
    },
    data() {
        return {
            isError: false,
            zoomEnabled: false,
            brushEnabled: false,
            brushXScale: null,
            brushExtent: [],
            brushSelection: null,
            toggleChoice: 'zoom'
        }
    },
    props: {
        DISABLE: {
            type: Boolean,
            default: true
        }    
    },
    methods: {
        plot: stitch.plot,
        zoomed: stitch.zoomed,
        removeBrushes: stitch.removeBrushes,
        stitchData: stitch.stitchData,
        toggleEdit: stitch.toggleEdit,
        drawBrushes: stitch.drawBrushes,
        newBrush: stitch.newBrush,
        resetToggle: stitch.resetToggle,
        resetPlot: stitch.resetPlot,
        changeScales: stitch.changeScales,
        removeStitchLine: stitch.removeStitchLine,
        saveStitchLine: stitch.saveStitchLine,
        drawSavedBrushes: stitch.drawSavedBrushes,
        checkError() {
            let len = document.getElementById("error-container").children.length;
            return len > 0 ? false : true;
        },
        resetDefaults() {
            this.brushXScale = null;
            this.zoomEnabled = false;
            this.brushEnabled = false;
            this.resetToggle();
        }
    }
}
</script>

<style scoped>
/* Anything that needs changing gets overidden here */
@import '../../assets/styles/plot-stitch-styles.css';
</style>