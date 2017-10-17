import * as d3 from 'd3';
import fd from '../../../assets/javascript/fitData.js';
/* Import Event Bus */
import { eventBus } from '../../../assets/javascript/eventBus';

export const brushed = {
    methods: {
        brushed() {
            let vm = this;
            
            // console.log("Calling brush...");
            vm.brushObj.brushSelection = d3.event.selection;
            
            //scales.xScale2.domain(scales.xScale.domain());
            var e = d3.event.selection.map(vm.scale.x2.invert, vm.scale.x2);
            
            let selectedData = vm.dataToFit.filter(function(d) {
                return e[0] <= d.x && d.x <= e[1];
            })

            // Update brush selections to the current selected data
            // This will be used to dynamically adjust brush location when new data is added
            vm.selLimits.xMin = d3.min(selectedData, function(d) { return d.x; });
            vm.selLimits.xMax = d3.max(selectedData, function(d) { return d.x; });

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
                d3.select("td#fit-file").html("<b>File: </b>" + vm.plotParameters.fileToFit);
                d3.select("td#fit-type").html("<b>Fit Type:</b> " + vm.plotParameters.fitConfiguration.fit);
                d3.select("td#fit-points").html("<b>No. Points:</b> " + selectedData.length);
                d3.select("td#fit-range").html("<b>Fit Range:</b> (" + e[0].toExponential(2) + ", " + e[1].toExponential(2) + ")");
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