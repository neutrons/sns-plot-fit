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
        },
    }
}