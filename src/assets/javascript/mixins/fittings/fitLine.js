import * as d3 from 'd3';
import { eventBus } from '../../eventBus';

export const fitLine = {
    methods: {
        initFitLine() {
            let vm = this;
            
            // Add fitted line
            vm.chart.g.append("g")
                .attr("id", "fit-line")
                .append("path")
                .attr("clip-path", "url(#clip-" + vm.ID + ")")
                .attr("class", "fitted-line");
        },
        updateFitLine() {
            let vm = this;

            // Re-draw plot lines with new data            
            let selectFitLine = vm.chart.g.select("#fit-line").select("path").data([vm.fitData]);

            selectFitLine.transition().duration(750)
                .attr("d", vm.line)
                .style("fill", "none")
                .style("stroke", vm.color(vm.plotParameters.fileToFit));

            // Update Fit Table
            var e = d3.extent(vm.dataToFit, function(d) { return d.x });

            vm.reviseFitTable(e, vm.dataToFit.length)
        },
        redrawFit(c) {
            let vm = this;
            
            // console.log("Coefficients are:", c);
            let temp = vm.chart.g.select(".fitted-line").datum();
            let tempX = [];

            // Grab x variables
            temp.forEach(function(d) {
                tempX.push(d.x);
            });

            let tempCoefficients = [];

            // Grab each coefficient
            for (let key in c) {
                tempCoefficients.push(c[key]);
            }

            // Re-fit equation with new coefficients
            let newFitEq = vm.fitEquation(tempCoefficients);

            // Re-fit line with updated fit equation
            let y_fitted = tempX.map(function(el) {
                return newFitEq(el);
            });

            // Return the fitted coordinates
            let fittedPoints = [];
            
            for (let i = 0; i < y_fitted.length; i++) {
                fittedPoints.push({
                    x: tempX[i],
                    y: y_fitted[i]
                });
            }

            // Update fit line with newly fitted coordinates
            vm.chart.g.select(".fitted-line").data([fittedPoints])
                .attr("d", vm.line);

            // Update coefficient values in results table
            let table = d3.select('#fit-results-table-' + vm.ID);

            table.select('td.fit-coefficients').html(function() {
                let coeffString = '<ul>';
                
                for (let key in c) {
                    coeffString += `<li> ${key} = ${c[key].toFixed(6)}</li>`;
                };

                coeffString += '</ul>';
                return coeffString;
            });
        }
    }
}