<template>
  <div id="StitchPlot" class="col-md-10">

            <!-- Plot Panel  -->
            <v-panel PANELTITLE="Stitch Plot" PANELTYPE="primary">
                <!-- Plot reset button inserted into panel heading  -->
                <!-- <button class="btn btn-success btn-xs pull-left btn-reset" @click="resetPlot" v-if="currentData.length > 0" slot="header-content">Reset Plot</button> -->
                <!-- <v-reset-button :onClick="resetPlot" v-if="!DISABLE" slot="header-content">Reset Plot</v-reset-button> -->
                
                <!-- <button class="btn btn-primary" @click="removeBrushes">Remove Brushes</button> -->
                <div id="stitch-plot"></div>
            </v-panel>
  </div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';
import * as d3 from 'd3';
/* Import Components */
import Panel from '../BaseComponents/Panels/Panel.vue';
import ResetButton from '../BaseComponents/ResetButton.vue';

/* Import Stitch Module */
import stitch from './moduleStitch.js';

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
        matchLine: stitch.matchLine,
        toggleEdit: stitch.toggleEdit,
        drawBrushes: stitch.drawBrushes,
        newBrush: stitch.newBrush,
        resetToggle: stitch.resetToggle,
        selectData: stitch.selectData,
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
    },
    mounted() {
        let vm = this;

        // Attach event listeners after elements have been created
        d3.selectAll('input[name=edit]').on('click', function() {
            vm.toggleEdit(this.value);
        });
        
        d3.select('#remove-brushes-btn').on('click', () => { vm.removeBrushes();});
        d3.select("#stitch-btn").on('click', () => { vm.matchLine();});
    }
}
</script>

<style scoped>
/* Many of the Plot 1D Styles are the same */
@import '../../assets/styles/plot-1D-styles.css';

/* Anything that needs changing gets overidden here */
@import '../../assets/styles/plot-stitch-styles.css';

#selection-error {
    position: absolute;
    top: 0;
    width: 100%;
}
</style>