import * as d3 from 'd3';
import * as d3hex from 'd3-hexbin';

export const updatePlot = {
    methods: {
        updatePlot(newData, binSize) {
            let vm = this;
                
            let plotData = _.cloneDeep(newData);
    
            // Adjust scale's domain whenver new data is added
            vm.scale.x.domain(d3.extent(plotData, function(d) { return d.qx;}));
            vm.scale.y.domain(d3.extent(plotData, function(d) { return d.qy;}));
    
            // Rescale to zoom's scale
            let t = d3.zoomTransform( vm.elements.svg.node());
            let new_yScale = t.rescaleY(vm.scale.y); 
            let new_xScale = t.rescaleX(vm.scale.x);
            
            // Adjust axis labels
            vm.axis.y.scale(new_yScale.copy());
            vm.axis.x.scale(new_xScale.copy());
            
            // Transition axis labels accordingly
            vm.elements.axis.transition().duration(750).select('.axis--y').call(vm.axis.y);
            vm.elements.axis.transition().duration(750).select('.axis--x').call(vm.axis.x);
    
            // Create hexbin generator
            var hexbin = d3hex.hexbin()
                .radius(vm.binSize)
                .extent([[0, 0], [vm.dimensions.w, vm.dimensions.h]]);
    
            // Create points, which are used to plot hexbins
            var points = [];
    
            plotData.forEach(function(el) { 
                points.push([
                    vm.scale.x(el.qx), 
                    vm.scale.y(el.qy), 
                    el.intensity
                ]) 
            });
    
            var hexbins = hexbin(points);
    
            for(let i = 0; i < hexbins.length; i++) {
                let sum = 0;
                for(let j = 0; j < hexbins[i].length; j++) {
                    sum += hexbins[i][j][2];
                }
                let avgIntensity = sum / hexbins[i].length; // sum average intensity for a bin
                hexbins[i].avgIntensity = avgIntensity; // Assign new object value to hexbins
            }
    
            // Create color scale generator using Viridis color set
            var color = d3.scaleSequential(d3.interpolateViridis)
                .domain(d3.extent(hexbins, function(d) { return d.avgIntensity; }));
    
            // Create legend scale generator
            vm.scale.l = d3.scaleLinear().domain(color.domain()).range([vm.dimensions.lh,0]).nice();
    
            // Create a value range for the legend color scale
            var valRange = d3.extent(hexbins, function(d) { return d.avgIntensity; });
    
            /********************************************************* 
                An interval is calculated to represent each "slice" of the
                legend's color values. Each "slice" will be stacked together
                to display the legend's vertical bar.
                
                Since height and range change depending on the data and
                size of chart, we dynamically find the interval
                e.g.) The extent of the average intensity = [-1, 1]
                    The height = 400
                    The interval = (1 - (-1)) / 400 
            **************************************************************/
            var interval = (valRange[1] - valRange[0]) / vm.dimensions.h;
            //console.log("Interval", interval);
    
            // Re-draw Legend
            let legendSelect = vm.elements.legend.select(".leg-bars")
                .selectAll(".bars")
                .data(d3.range(valRange[1],valRange[0], -interval), function(d) { return d; });
    
            // Remove old legend bars
            legendSelect.exit().remove();
    
            // Enter new legend bars
            legendSelect.enter()
                .append("rect")
                    .attr("class", "bars")
                    .attr("x", 0)
                    .attr("y", function(d, i) { return i; })
                    .attr("height", 1)
                    .attr("width", vm.dimensions.lw)
                    .style("fill", function(d, i ) { 
                        return color(d); 
                    });
    
            vm.elements.legend.select('.legend-axis-y')
                              .transition().duration(750)
                              .call(d3.axisRight(vm.scale.l));
    
            // Hex radius is tweaked to eliminate white spaces between hexagons
            // This needs to be further investigated because overlap isn't visible.
            var hexRad = vm.binSize + 0.4;
    
            // Re-draw Hex Plot
            vm.elements.plot.select(".hexagon").selectAll('.hexagons').remove();
            
            vm.elements.plot.select(".hexagon").selectAll('path').data(hexbins).enter()
                .append("path")
                .attr("d", hexbin.hexagon(hexRad))
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                .attr("fill", function(d) { return color(d.avgIntensity); })
                .attr("stroke", "none")
                .attr("class", "hexagons")
                .on("mouseover", function(d) {
                    vm.elements.tooltip.transition()
                        .duration(200)
                        .style("opacity", 1);
    
                    vm.elements.tooltip.html("Qx: " + vm.scale.x.invert(d.x).toFixed(4) + "<br/>" + "Qy: " + vm.scale.y.invert(d.y).toFixed(4) + "<br/> Avg. Intensity: " + d.avgIntensity.toFixed(4))
                        .style("top", (d3.event.pageY - 40) + "px")
                        .style("left", (d3.event.pageX + 15) + "px");
                })
                .on("mouseout", function(d) {
                    vm.elements.tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        }
    }
}