<template>
  <div id="StitchPlot" class="col-md-10">

            <!-- Plot Panel  -->
            <v-panel PANELTITLE="Stitch Plot" PANELTYPE="primary">
                <!-- Plot reset button inserted into panel heading  -->
                <!-- <button class="btn btn-success btn-xs pull-left btn-reset" @click="resetPlot" v-if="currentData.length > 0" slot="header-content">Reset Plot</button> -->
                <v-reset-button :onClick="resetPlot" v-if="!DISABLE" slot="header-content">Reset Plot</v-reset-button>
                
                <button class="btn btn-primary" @click="removeBrushes">Remove Brushes</button>
                <div id="plot-stitch"></div>
            </v-panel>
  </div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

/* Import Components */
import Panel from '../BaseComponents/Panels/Panel.vue';
import ResetButton from '../BaseComponents/ResetButton.vue';

import * as _ from 'lodash';
import * as d3 from 'd3';
import $ from 'jquery';

export default {
    name: 'StitchPlot',
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
    data: function() {
        return {
            currentSelection: {
                'one': {
                    start: null,
                    end: null
                },
                'two': {
                    start: null,
                    end: null
                }
            },
            brushes: []
        }
    },
    created() {
        var vm = this;

        //set dimensions and margin
        var margin = {top:50, bottom:50, left:50, right:50};
        var width = 960, height = 500;

        //create scales
        var xScale = d3.scaleTime()
        .range([0, width]);

        var yScale = d3.scaleLinear()
        .range([height, 0]);

        //create plot area
        var svg = d3.select('#stitch-plot')
            .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);

        var plotArea = svg.append('g')
            .attr("id", "chart")
            .attr('transform',
                'translate(' + margin.left + ',' + margin.top + ')');

        // We initially generate a SVG group to keep our brushes' DOM elements in:
        var gBrushes = svg.append('g')
            .attr("height", height)
            .attr("width", width)
            .attr("fill", "none")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "brushes");

            

        vm.newBrush();
        vm.drawBrushes();
        /****** END OF BRUSH FEATURE **************/

        //scale the range of the data
        xScale.domain([0,100]);
        yScale.domain([0, 100]);

        //Add Axes
        plotArea.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(xScale));

        plotArea.append('g')
            .attr('class', 'axis axis--y')
            .call(d3.axisLeft(yScale));

    },
    methods: {
        newBrush() {
            var vm = this;
            
            // console.log("new brush");
            var brush = d3.brushX()
                .extent([[0, 0], [960, 500]])
                .on("start", brushstart)
                .on("brush", brushed)
                .on("end", brushend);

                vm.brushes.push({id: vm.brushes.length, brush: brush});

                function brushstart() {
                    // your stuff here
                    // console.log("Brush start");
                };

            function brushed() {
                // your stuff here
                if(this.id === 'brush-0') {
                    let selection = d3.event.selection;
                    selection[0] = xScale.invert(selection[0]);
                    selection[1] = xScale.invert(selection[1]);

                    vm.currentSelection.one.start = selection[0];
                    vm.currentSelection.one.end = selection[1];
                } else {
                    let selection = d3.event.selection;
                    selection[0] = xScale.invert(selection[0]);
                    selection[1] = xScale.invert(selection[1]);

                    currentSelection.two.start = selection[0];
                    currentSelection.two.end = selection[1];
                }

                if(vm.currentSelection.one.start && vm.currentSelection.two.start) {
                    console.log("Both have selections.");
                }
                console.log(vm.currentSelection.one, vm.currentSelection.two);
            }

            function brushend() {
                //   console.log("Brush end");
                // Figure out if our latest brush has a selection
                var lastBrushID = vm.brushes[vm.brushes.length - 1].id;
                var lastBrush = document.getElementById('brush-' + lastBrushID);
                var selection = d3.brushSelection(lastBrush);

                // If it does, that means we need another one
                if (vm.brushes.length < 2 && selection && selection[0] !== selection[1]) {
                    vm.newBrush();
                }

                // Always draw brushes
                vms.drawBrushes();
            }
        },
        drawBrushes() {
            var vm = this;


            var brushSelection = gBrushes
                .selectAll('.brush')
                .data(vm.brushes, function (d){return d.id});

                // Set up new brushes
            brushSelection.enter()
                .insert("g", '.brush')
                .attr('class', function(brush) {
                    if(brush.count === 'First overlay') {
                        return 'brush first-overlay';
                    } else {
                        return 'brush';
                    }
                })
                .attr('id', function(brush){ return "brush-" + brush.id; })
                .each(function(brushObject) {
                //call the brush
                brushObject.brush(d3.select(this));
                });

                /* REMOVE POINTER EVENTS ON BRUSH OVERLAYS
                *
                * This part is abbit tricky and requires knowledge of how brushes are implemented.
                * They register pointer events on a .overlay rectangle within them.
                * For existing brushes, make sure we disable their pointer events on their overlay.
                * This frees the overlay for the most current (as of yet with an empty selection) brush to listen for click and drag events
                * The moving and resizing is done with other parts of the brush, so that will still work.
                */
            brushSelection
                .each(function (brushObject){
                d3.select(this)
                    .attr('class', 'brush')
                    .selectAll('.overlay')
                    .style('pointer-events', function() {
                    var brush = brushObject.brush;
                    if (brushObject.id === vm.brushes.length-1 && brush !== undefined) {
                        return 'all';
                    } else {
                        return 'none';
                    }
                    });
                })

            brushSelection.exit()
                .remove();
        },
        removeBrushes() {
            d3.selectAll('.brush').remove();
            this.brushes = [];
            resetSelections();
            newBrush();
            drawBrushes();
        },
        resetSelections() {
            this.currentSelection.one = {start: null, end: null};
            this.currentSelection.two = {start: null, end: null};
        }
    }
}
</script>

<style scoped>
.axis path,
.axis line {
   fill: none;
   stroke: grey;
   stroke-width: 1;
   shape-rendering: crispEdges;
}

.legend {
    font-size: 16px;
    font-weight: bold;
    text-anchor: middle;
}

.selection {
  fill: green;
  stroke: black;
  stroke-width: 1px;
  stroke-dasharray: 3px 3px;
}
</style>