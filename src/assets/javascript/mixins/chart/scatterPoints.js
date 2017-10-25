import * as d3 from 'd3';
import tooltip from './tooltip.js';

export default function(selection, x, y, vm) {
    selection.append("circle")
        .attr("class", "dot")
        .filter(function(d) {
            return d.x !== null && d.x !== NaN && d.y !== null && d.y !== NaN;
        })
        .attr("cx", function(d) {
            return x(d.x);
        })
        .attr("cy", function(d) {
            return y(d.y);
        })
        .attr("r", 4)
        .style("fill", function(d) {
            return d.color = vm.color(d.name);
        })
        .on("mouseover", function(d) { 
            let htmlString = "Name: " + d.name + "<br/>" + "X: " + d.x.toFixed(6) + "<br/>" + "Y: " + d.y.toFixed(6) + "<br/>" + "Error: " + d.e.toFixed(6);
            tooltip.enter(d, htmlString, vm.elements.tooltip) 
        })
        .on("mouseout", function (d) { tooltip.exit(d, vm.elements.tooltip) })
        .on("click", function(d,i) {
            vm.removePointExtend(i, d.name);
        });
}