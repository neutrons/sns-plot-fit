import * as d3 from 'd3';
import * as d3hex from 'd3-hexbin';
import tooltip from '../../../assets/javascript/mixins/d3/tooltip.js';

export const updateChart = {
    methods: {
        updateChart(newData, binSize) {
            let vm = this;
            let trans = d3.transition().duration(750);
                
            vm.plotData = _.cloneDeep(newData);
    
            // Adjust scale's domain whenver new data is added
            vm.adjustDomains();
    
            // Rescale to zoom's scale
            let t = d3.zoomTransform( vm.chart.g.select('.zoom').node());
            let new_yScale = t.rescaleY(vm.scale.y); 
            let new_xScale = t.rescaleX(vm.scale.x);
            
            // Adjust axis labels
            vm.updateAxes(new_xScale, new_yScale);
    
            // Create hexbin generator
            var hexbin = d3hex.hexbin()
                .radius(vm.binSize)
                .extent([[0, 0], [vm.dimensions.w, vm.dimensions.h]]);
    
            // Create points, which are used to plot hexbins
            var points = [];
    
            vm.plotData.forEach((el) => { 
                points.push([
                    vm.scale.x(el.qx), 
                    vm.scale.y(el.qy), 
                    el.intensity
                ]) 
            });
    
            var hexbins = hexbin(points);
    
            for (let i = 0; i < hexbins.length; i++) {
                let sum = 0;

                for (let j = 0; j < hexbins[i].length; j++) {
                    sum += hexbins[i][j][2];
                }

                let avgIntensity = sum / hexbins[i].length; // sum average intensity for a bin
                hexbins[i].avgIntensity = avgIntensity; // Assign new object value to hexbins
            }
    
            // Create color scale generator using Viridis color set
            vm.color = d3.scaleSequential(d3.interpolateViridis)
                .domain(d3.extent(hexbins, (d) => { return d.avgIntensity; }));
    
            // Create legend scale generator
            vm.scale.l = d3.scaleLinear()
                .range([vm.dimensions.lh,0])
                .domain(vm.color.domain())
                .nice();
    
            // Create a value range for the legend color scale
            var valRange = d3.extent(hexbins, (d) => { return d.avgIntensity; });
    
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
            let legendSelect = vm.chart.svg.select('.legend').select(".leg-bars")
                .selectAll(".bars")
                .data(
                    d3.range(valRange[1], valRange[0], -interval),
                    (d) => { return d; }
                );
    
            // EXIT LEGEND BARS
            legendSelect.exit().remove();
    
            // ENTER LEGEND BARS
            legendSelect.enter()
                .append("rect")
                    .attr("class", "bars")
                    .attr("x", 0)
                    .attr("y", (d, i) => { return i; })
                    .attr("height", 1)
                    .attr("width", vm.dimensions.lw)
                    .style("fill", (d, i ) => { 
                        return vm.color(d); 
                    });
    
            vm.chart.svg.select('.legend')
                .select('.legend-axis-y')
                .transition(trans)
                .call(d3.axisRight(vm.scale.l));
    
            // EXIT HEXAGONS
            vm.chart.g.select(".hexagon").selectAll('.hexagons').remove();
            
            // ENTER HEXAGONS
            vm.chart.g.select(".hexagon").selectAll('path').data(hexbins).enter()
                .append("path")
                .attr("d", hexbin.hexagon(vm.binSize))
                .attr("transform", (d) => { return "translate(" + d.x + "," + d.y + ")"; })
                .attr("fill", (d) => { return vm.color(d.avgIntensity); })
                .attr("stroke", (d) => { return vm.color(d.avgIntensity); }) // stroke to same color to remove 'padding' between hexagons
                .attr("class", "hexagons")
                .on("mouseover", (d) => {
                    let htmlString = "Qx: " + vm.scale.x.invert(d.x).toFixed(4) + "<br/>" + "Qy: " + vm.scale.y.invert(d.y).toFixed(4) + "<br/> Avg. Intensity: " + d.avgIntensity.toFixed(4);
                    tooltip.enter(d, vm.chart.tooltip, htmlString);
                })
                .on("mouseout", (d) => {
                    tooltip.exit(d, vm.chart.tooltip);
                });
        }
    }
}