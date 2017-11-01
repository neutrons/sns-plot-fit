import * as d3 from 'd3';
import setLineGenerator from '../../../assets/javascript/mixins/chart/setLineGenerator.js';
import tooltip from '../../../assets/javascript/mixins/chart/tooltip.js';

export const updatePlot = {
    methods: {
        updatePlot() {
            
            let vm = this;

            // Then adjust scale's domain whenver new data is added
            // vm.adjustDomains();
            
            // Then rescale to zoom's scale
            let t = d3.zoomTransform( vm.elements.zoom.select('.zoom').node());
            let new_yScale = t.rescaleY(vm.scale.y); 
            let new_xScale = t.rescaleX(vm.scale.x);

            // Adjust axis and gridline labels
            vm.axis.y.scale(new_yScale);
            vm.axis.x.scale(new_xScale);
            vm.axis.yGrid.scale(new_yScale);
            vm.axis.xGrid.scale(new_xScale);

            // Transition axis and gridlines labels accordingly
            vm.elements.axis.transition().duration(750).select('.axis--y').call(vm.axis.y);
            vm.elements.axis.transition().duration(750).select('.axis--x').call(vm.axis.x);
            vm.elements.axis.transition().duration(750).select('.gridline--y').call(vm.axis.yGrid);
            vm.elements.axis.transition().duration(750).select('.gridline--x').call(vm.axis.xGrid);

            //Add a Line Plot Function
            setLineGenerator(vm, new_xScale, new_yScale);

            // Update all circles
            let scatterSelect = vm.elements.plot.selectAll("circle").data(vm.plotData);
            
            // Re-position points
            scatterSelect.transition().duration(750)
                .attr("cx", function(d) {
                    return new_xScale(d.x);
                })
                .attr("cy", function(d) {
                    return new_yScale(d.y);
                });

            // Enter new points
            scatterSelect.enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", function(d) {
                    return new_xScale(d.x);
                })
                .attr("cy", function(d) {
                    return new_yScale(d.y);
                })
                .attr("r", 4)
                .style("fill", 'green')
                .on("mouseover", function(d) { 
                    let htmlString = vm.labels.x + ": " + d.x.toFixed(6) + "<br/>" + vm.labels.y + ": " + d.y.toFixed(6);
                    tooltip.enter(d, htmlString, vm.elements.tooltip) 
                })
                .on("mouseout", function (d) { tooltip.exit(d, vm.elements.tooltip) });

            // Remove old
            scatterSelect.exit().remove();  
        }
    }
}