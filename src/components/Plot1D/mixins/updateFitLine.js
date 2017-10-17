import * as d3 from 'd3';

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
            var minX = d3.min(vm.dataToFit, function(d) { return d.x });
            var maxX = d3.max(vm.dataToFit, function(d) { return d.x });

            d3.select("td#fit-file").html("<b>File: </b>" + vm.plotParameters.fileToFit);
            d3.select("td#fit-type").html("<b>Fit Type:</b> " + vm.plotParameters.fitConfiguration.fit);
            d3.select("td#fit-points").html("<b>No. Points:</b> " + vm.dataToFit.length);
            d3.select("td#fit-range").html("<b>Fit Range:</b> (" + minX.toExponential(2) + ", " + maxX.toExponential(2) + ")");
            d3.select("td#fit-error").html("<b>Fit Error:</b> " + vm.fitError.toExponential(2));
            
            d3.select("td#fit-coefficients").html(function() {
                let coeffString = "<ul>";
                for( let key in vm.coefficients) {
                    
                    if(vm.plotParameters.fitConfiguration.fit.toLowerCase().includes('guinier')) {

                        if(key === 'I0') {
                            let I0 = Math.exp(vm.coefficients[key]);
                        
                            coeffString += "<li>Real " + key + " = " + I0 + "</li>";
                            continue;
                        }

                        if(key === 'Rg') {
                            let RgX = vm.coefficients[key] * Math.sqrt(vm.scale.x.invert(vm.brushObj.brushSelection[1]));
                            coeffString += "<li>" + key + " = " + vm.coefficients[key].toFixed(3) + " | Rg * x_max = " + RgX.toFixed(3) + "</li>";
                            continue;
                        }
                    }

                    coeffString += "<li>" + key + " = " + vm.coefficients[key].toFixed(3) + "</li>";
                }
                coeffString += "</ul>";
                return coeffString;
            });

            d3.select("li#fit-damping").html("<b>Damping: </b>" + vm.plotParameters.fitSettings.damping);
            d3.select("li#fit-iterations").html("<b>No. Iterations: </b>" + vm.plotParameters.fitSettings.maxIterations);
            d3.select("li#fit-tolerance").html("<b>Error Tolerance: </b>" + vm.plotParameters.fitSettings.errorTolerance);
            d3.select("li#fit-gradient").html("<b>Gradient Difference: </b>" + vm.plotParameters.fitSettings.gradientDifference);

            d3.select("#fit-note").html(vm.plotParameters.fitConfiguration.note);
        }
    }
}