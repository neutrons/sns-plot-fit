import * as d3 from 'd3';
import reviseFitTable from './reviseFitTable.js';

export const updateFitLine = {
    methods: {
        updateFitLine() {
            let vm = this;

            // update fitted line
            // Re-draw plot lines with new data            
            let selectFitLine = vm.elements.plot.select("#fit-line").select("path").data([vm.fitData]);

            selectFitLine.transition().duration(750)
                .attr("d", vm.line)
                .style("fill", "none")
                .style("stroke", vm.color(vm.plotParameters.fileToFit));

            // Update Fit Table
            var e = d3.extent(vm.dataToFit, function(d) { return d.x });

            reviseFitTable(e, vm, vm.dataToFit.length)

            d3.select("li#fit-damping").html("<b>Damping: </b>" + vm.plotParameters.fitSettings.damping);
            d3.select("li#fit-iterations").html("<b>No. Iterations: </b>" + vm.plotParameters.fitSettings.maxIterations);
            d3.select("li#fit-tolerance").html("<b>Error Tolerance: </b>" + vm.plotParameters.fitSettings.errorTolerance);
            d3.select("li#fit-gradient").html("<b>Gradient Difference: </b>" + vm.plotParameters.fitSettings.gradientDifference);

            d3.select("#fit-note").html(vm.plotParameters.fitConfiguration.note);
        }
    }
}