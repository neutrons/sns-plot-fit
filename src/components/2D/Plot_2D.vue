<template>
<div id="Plot-2d" class="col-md-10">
    <div id="plot-panel">
        <div class="panel-group">

            <div class="panel panel-default">
                <div class="panel-heading">
                    <button id="btn-reset-plot" class="btn btn-default btn-sm pull-left" @click="resetPlot" v-if="BUTTONDIS">Reset Plot</button>
                    <div id="plot-panel-collapse-2d">2D Plot <span class="glyphicon glyphicon-menu-up pull-right"></span></div>
                </div>
            </div>

            <div id="plot-collapse-2" class="panel-body">

                <div id="plot-area"></div>

            </div>
        </div>
    </div>
</div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

import * as _ from 'lodash';
import * as d3 from 'd3';
import $ from 'jquery';

export default {
    name: 'Plot-2d',
    props: ["BUTTONDIS"],
    data: function() {
        return {
            
        }
    },
    computed: {},
    methods: {
        resetPlot: function() {

        }
    },
created() {},
    watch: {}
}
</script>

<style scoped>
/* Styles for Plot Area */
#plot-panel-collapse-2d {
    cursor: pointer;
    padding: 7px 5px;
}

#plot-collapse-2d {
    background: rgba(0,0,0, 0.02);
}
</style>