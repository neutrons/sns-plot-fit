import * as d3 from 'd3';
import { eventBus } from '../../eventBus';

export const fitLine = {
    methods: {
        initFitLine() {
            
            // Add fitted line
            this.chart.g.append('g')
                .attr('id', `fit-line-${this.ID}`)
                .append('path')
                .attr('clip-path', `url(#clip-${this.ID})`)
                .attr('class', 'fitted-line');
        },
        updateFitLine() {

            // Re-draw plot lines with new data            
            let selectFitLine = this.chart.g.select(`#fit-line-${this.ID}`).select('path').data([this.fitData]);

            selectFitLine.transition().duration(750)
                .attr('d', this.line)
                .style('fill', 'none')
                .style('stroke', this.color(this.plotParameters.fileToFit));

            // Update Fit Table
            var e = d3.extent(this.dataToFit, function(d) { return d.x });

            this.reviseFitTable(e, this.dataToFit.length)
        },
        redrawFit(c) {           
            // console.log('Coefficients are:', c);
            let temp = this.chart.g.select('.fitted-line').datum();
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
            let newFitEq = this.fitEquation(tempCoefficients);

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
            this.chart.g.select('.fitted-line').data([fittedPoints])
                .attr('d', this.line);

            // Update coefficient values in results table
            let table = d3.select(`#fit-results-table-${this.ID}`);

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