import * as d3 from 'd3';
import _ from 'lodash';

import { eventBus } from '../../../assets/javascript/eventBus';

export const drawPlot = {
    methods: {
        drawPlot() {
            let vm = this;

            vm.labels.x = vm.plotParameters.labels.x;
            vm.labels.y = vm.plotParameters.labels.y;

            // If plot is already present, simply update with the new set of data
            if (!d3.select(".chart-stitch").empty()) {
            
                // Remove stitch line if present,
                d3.select("#stitched-line").remove();
    
                // Hide Stitch related buttons
                eventBus.$emit("reset-is-stitched");
                
                vm.brushObj.brushCount = vm.plotParameters.brushCount - 1;
    
                vm.removeBrushes();
    
                vm.toggleEdit(vm.toggleChoice);
                vm.updatePlot(_.cloneDeep(vm.plotParameters.data));
                vm.updateBrushScale();
                vm.updateStitchLine();

                return;
            }

            vm.dataNest = _.cloneDeep(vm.plotParameters.data); //regular data to plot

            // Set plot dimensions
            vm.initDimensions();

            // Set scales
            vm.initScales();

            // Set initial Elements
            vm.setElements();

            // Generate a SVG group to keep brushes
            vm.brushObj.brushGroup = vm.elements.zoom.select("#zoom-stitch").append('g')
                .attr("height", vm.dimensions.h)
                .attr("width", vm.dimensions.w)
                .attr("fill", "none")
                .attr("transform", "translate(" + vm.margin.left + "," + vm.margin.top + ")")
                .attr("class", "brushes");

            // set up brush layer
            vm.newBrush();
            vm.drawBrushes();
            
            // Set zoom on zoomWindow
            vm.elements.zoom.select(".zoom").call(vm.zoom);

            // Create a responsive chart
            vm.setResponsive();

            // Now finally update the plot with current data
            vm.toggleEdit(vm.toggleChoice);
            vm.updatePlot(vm.dataNest);
            vm.updateBrushScale();
            vm.updateStitchLine();
        }
    }
}