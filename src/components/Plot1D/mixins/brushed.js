import * as d3 from 'd3';
import fd from '../../../assets/javascript/fitData.js';
/* Import Event Bus */
import { eventBus } from '../../../assets/javascript/eventBus';

import reviseFitTable from './reviseFitTable.js';

export const brushed = {
    methods: {
        brushed() {
            let vm = this;
            
            // console.log("Calling brush...");
            vm.brushObj.brushSelection = d3.event.selection;
            
            var e = d3.event.selection.map(vm.scale.x2.invert, vm.scale.x2);
            
            let selectedData = vm.dataToFit.filter(function(d) {
                return e[0] <= d.x && d.x <= e[1];
            })

            // Update brush selections to the current selected data
            // This will be used to dynamically adjust brush location when new data is added
            // vm.selLimits.xMin = d3.min(selectedData, function(d) { return d.x; });
            // vm.selLimits.xMax = d3.max(selectedData, function(d) { return d.x; });
            vm.selLimits = d3.extent(selectedData, function(d) { return d.x; });

            if (vm.brushObj.brushSelection !== null && selectedData.length > 1) {

                vm.elements.slider.selectAll(".dotslider")
                    .style("stroke", function (d) {
                        if(e[0] <= d.x && d.x <= e[1]) {
                            return d.color = vm.color(d.name);
                        } else {
                            return "slategray";
                        }
                    })
        
                vm.fitResults = fd.fitData(selectedData, vm.plotParameters.fitConfiguration.equation, vm.plotParameters.fitSettings);
                vm.coefficients = vm.fitResults.coefficients;
                vm.fitData = vm.fitResults.fittedData;
                vm.fitError = vm.fitResults.error;

                // Re-assign updated fit equation and fitline function
                vm.fitEquation = vm.fitResults.fitEquation;

                if(vm.fitData.length <= 0) {
                    if(vm.checkError()) {
                        let errorMsg = "<strong>Error!</strong> Fitted y-values < 0, thus no fit-line to display.";
                        eventBus.$emit('error-message', errorMsg, 'danger');
                    }
                }
                // Emit coefficients to controls panel
                eventBus.$emit('update-coefficients', vm.coefficients);

                // Add line plot
                vm.elements.plot.select(".fitted-line").data([vm.fitData])
                    .attr("d", vm.line);

                // Revise fit results below chart
                let limits = d3.extent(selectedData, function(d) { return d.x; });
                reviseFitTable(limits, vm, selectedData.length);
            } else {
                // Notify user that more data needs to be selected for the fit
                if(vm.checkError()) {
                    let errorMsg = "<strong>Error!</strong> Not enough data selected, please select 2 or more points. If plot is blank, no data is available for generating a fit line.";
                    eventBus.$emit('error-message', errorMsg, 'danger');
                }
            }
        }
    }
}