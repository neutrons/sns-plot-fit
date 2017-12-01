import * as d3 from 'd3';

let tooltip = {};

tooltip.enter = function(d, selection, htmlString) {

    htmlString = htmlString || '';
    
    // Iterate through data values to create tooltip info
    if (htmlString === '') {
        for (let key in d) {
            // Don't include color or dx in tooltip
            if  (['color', 'dx'].indexOf(key) > -1)   continue;
            
            if  (key === 'name') {
                // Use string templates to insert file name at the beginning
                htmlString = `File: ${d[key]}<br/>${htmlString}`;
            } else {
                htmlString += key + ': ' + d[key].toFixed(6) + '<br/>';
            }
        };
    }
    
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