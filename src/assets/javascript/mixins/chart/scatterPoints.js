import * as d3 from 'd3';

export default function(selection, x, y, color) {
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
            return d.color = color(d.name);
        });
}