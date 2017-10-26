import * as d3 from 'd3';

let tooltip = {};

tooltip.enter = function(d, htmlString, selection) {
    
    selection.transition()
        .duration(200)
        .style("opacity", 1);

    selection.html(htmlString)
        .style("top", (d3.event.pageY - 40) + "px")
        .style("left", (d3.event.pageX + 20) + "px");
}

tooltip.exit = function(d, selection) {
    selection.transition()
        .duration(500)
        .style("opacity", 0);
}

export default tooltip;