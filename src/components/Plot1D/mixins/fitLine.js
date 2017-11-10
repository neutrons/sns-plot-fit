import * as d3 from 'd3';

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

            d3.select("li#fit-damping").html("<b>Damping: </b>" + vm.plotParameters.fitSettings.damping);
            d3.select("li#fit-iterations").html("<b>No. Iterations: </b>" + vm.plotParameters.fitSettings.maxIterations);
            d3.select("li#fit-tolerance").html("<b>Error Tolerance: </b>" + vm.plotParameters.fitSettings.errorTolerance);
            d3.select("li#fit-gradient").html("<b>Gradient Difference: </b>" + vm.plotParameters.fitSettings.gradientDifference);

            d3.select("#fit-note").html(vm.plotParameters.fitConfiguration.note);
        },
        redrawFit(c) {
            let vm = this;
            
            // console.log("Coefficients are:", c);
            let temp = vm.chart.g.select(".fitted-line").datum();
            let tempX = [];

            temp.forEach(function(d) {
                tempX.push(d.x);
            });

            let tempCoefficients = [];
            for(let key in c) {
                tempCoefficients.push(c[key]);
            }

            let newFitEq = vm.fitEquation(tempCoefficients);

            let y_fitted = tempX.map(function(el) {
                return newFitEq(el);
            });

            // Return the fitted values
            let fittedPoints = [];
            
            for(let i = 0; i < y_fitted.length; i++) {
                fittedPoints.push({
                    x: tempX[i],
                    y: y_fitted[i]
                });
            }

            vm.chart.g.select(".fitted-line").data([fittedPoints])
                .attr("d", vm.line);

            // Update coefficient values in results table
            d3.select("td#fit-coefficients").html(function() {
                let coeffString = "<ul>";
                for( let key in c) {
                    coeffString += "<li>" + key + " = " + c[key].toFixed(6) + "</li>";
                }
                coeffString += "</ul>";
                return coeffString;
            });
        }
    }
}