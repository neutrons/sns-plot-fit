import * as d3 from 'd3';
import _ from 'lodash';

import { eventBus } from '../../../assets/javascript/eventBus';

export const drawChart = {
    methods: {
        drawChart() {
            let vm = this;

            vm.label.x = vm.plotParameters.label.x;
            vm.label.y = vm.plotParameters.label.y;

            // If plot is already present, simply update with the new set of data
            if (!d3.select(".chart-Stitch").empty()) {
            
                // Remove stitch line if present,
                d3.select("#stitched-line").remove();
    
                // Hide Stitch related buttons
                eventBus.$emit("reset-is-stitched");
                
                vm.brushObj.brushCount = vm.plotParameters.brushCount - 1;
    
                vm.removeBrushes();
    
                vm.toggleEdit(vm.toggleChoice);
                vm.updateChart(_.cloneDeep(vm.plotParameters.data));
                vm.updateBrushScale();
                vm.updateStitchLine();

                return;
            }

            vm.dataNest = _.cloneDeep(vm.plotParameters.data); //regular data to plot

            // Set plot dimensions
            vm.initDimensions();

            // Set scales
            vm.initScales();
            vm.initColorScale();
            vm.initAxes();
            vm.initGrids();

            // Set initial Elements
            vm.setChartElements();

            // Add a group element for error bars
            vm.chart.g.select('.chart-elements').insert('g', ':first-child')
                .attr('clip-path', 'url(#clip-' + vm.ID + ')')
                .attr('id', 'error-' + vm.ID)

            vm.addLabels();

            // Generate a SVG group to keep brushes
            vm.chart.g.select('#zoom-group-' + vm.ID).append('g')
                .attr("class", "brushes")
                .attr("height", vm.dimensions.h)
                .attr("width", vm.dimensions.w)
                .attr("fill", "none");

            // set up brush layer
            vm.newBrush();
            vm.drawBrushes();
            
            // Set zoom on zoomWindow
            vm.chart.g.select('.zoom-group').select('.zoom').call(vm.zoom);
            // vm.elements.zoom.select(".zoom").call(vm.zoom);

            // Create a responsive chart
            vm.setResponsive();

            // Now finally update the plot with current data
            vm.toggleEdit(vm.toggleChoice);
            vm.updateChart(vm.dataNest);
            vm.updateBrushScale();
            vm.updateStitchLine();
        }
    }
}