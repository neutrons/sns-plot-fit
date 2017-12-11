import * as d3 from 'd3';
import tooltip from './tooltip.js';

export const scatter = {
    methods: {
        updateScatter(selection, x = this.scale.x, y = this.scale.y, t = d3.transition().duration(0)) {
            let vm = this;

            // EXIT
            selection.exit().remove();

            // UPDATE
            selection.transition(t)
                .attr("cx", (d) => { return x(d.x)})
                .attr("cy", (d) => { return y(d.y)});

            // ENTER
            selection.enter()
                .append("circle")
                .attr("class", "dot")
                .filter(function(d) {
                    return d.x !== null && d.x !== NaN && d.y !== null && d.y !== NaN;
                })
                .attr("cx", (d) => { return x(d.x) })
                .attr("cy", (d) => { return y(d.y) })
                .attr("r", 3.5)
                .style("fill", (d) => { return d.color = vm.color(d.name)})
                .on("mouseover", (d) => {        
                    tooltip.enter(d, vm.chart.tooltip) 
                })
                .on("mouseout", (d) => { tooltip.exit(d, vm.chart.tooltip) })
                .on("click", (d,i) => {
                    vm.removePoint(i, d.name);
                });
        }
    }
}