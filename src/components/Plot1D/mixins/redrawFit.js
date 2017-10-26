import * as d3 from 'd3';

export const redrawFit = {
    methods: {
        redrawFit(c) {
            let vm = this;
            
            // console.log("Coefficients are:", c);
            let temp = d3.select(".fitted-line").datum();
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

            d3.select(".fitted-line").data([fittedPoints])
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