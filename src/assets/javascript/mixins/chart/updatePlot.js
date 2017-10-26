import * as d3 from 'd3';
import store from '../../../../store/index.js';
import setLineGenerator from './setLineGenerator.js';
import tooltip from './tooltip.js';
import errorbars from './errorBars.js';
import scatterPoints from './scatterPoints.js';

export const updatePlot = {
    methods: {
        updatePlot(newData) {
            let vm = this;

            // First update plot data to new data
            vm.dataNest = newData;
    
            // Then adjust scale's domain whenver new data is added
            vm.adjustDomains();           
    
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
    
            // Add and update data
            vm.dataNest.forEach(function (d, i) {
                
                // Add new elements if nothing exists
                if (d3.select("#line-" + vm.ID + "-" + d.key).empty()) {
                    
                    // Add line plot
                    vm.elements.plot.append("g").attr("id", "line-" + vm.ID + "-" + d.key)
                    .append("g")
                    .attr("clip-path", "url(#clip-" + vm.ID + ")")
                    .append("path")
                        .data([d.values])
                        .attr("class", "pointlines")
                        .attr("d", vm.line)
                        .style("fill", "none")
                        .style("stroke", function () {
                            return d.color = vm.color(d.key);
                        });
                    
                    // Add error lines
                    vm.elements.plot.append("g").attr("id", "error-" + vm.ID + "-" + d.key)
                        .append("g")
                        .attr("clip-path", "url(#clip-" + vm.ID + ")")
                            .selectAll(".error-" + vm.ID)
                            .data(d.values)
                            .enter()
                            .call(errorbars.line, new_xScale, new_yScale, vm);
                    
                    // Add error tick top
                    vm.elements.plot.append("g").attr("id", "error-" + vm.ID + "-top-" + d.key)
                        .append("g")
                        .attr("clip-path", "url(#clip-" + vm.ID + ")")
                            .selectAll(".error-" + vm.ID + "-tick-top")
                            .data(d.values)
                            .enter()
                            .call(errorbars.caps, 'top', new_xScale, new_yScale, vm);
    
                    // Add error tick bottom
                    vm.elements.plot.append("g").attr("id", "error-" + vm.ID + "-bottom-" + d.key)
                        .append("g")
                        .attr("clip-path", "url(#clip-" + vm.ID + ")")
                            .selectAll(".error-" + vm.ID + "-tick-bottom")
                            .data(d.values)
                            .enter()
                            .call(errorbars.caps, 'bottom', new_xScale, new_yScale, vm);
    
                    // Add Scatter plot
                    vm.elements.plot.append("g").attr("id", "scatter-" + vm.ID + "-" + d.key)
                        .append("g")
                        .attr("clip-path", "url(#clip-" + vm.ID + ")")
                        .selectAll(".dot")
                        .data(d.values)
                            .enter()
                            .call(scatterPoints, new_xScale, new_yScale, vm);
                            
                } else {
                    
                    // Re-draw plot lines with new data
                    let lineSelect = vm.elements.plot.select("#line-" + vm.ID + "-" +d.key).select("path").data([d.values]);
                    
                    lineSelect.transition().duration(750).attr("d", vm.line);
    
                    // Re-draw Error Lines
                    let errorSelect = vm.elements.plot.select("#error-" + vm.ID + "-" +d.key).selectAll("line").data(d.values);
                    
                    errorSelect.transition().duration(750).call(errorbars.updateLine, new_xScale, new_yScale, vm.scale.yType);
                    
                    // Enter new error Lines
                    errorSelect.enter().call(errorbars.line, new_xScale, new_yScale, vm);
    
                    // Remove old error lines
                    errorSelect.exit().remove();
    
                    // Re-draw Error Top
                    let errorTopSelect = vm.elements.plot.select("#error-" + vm.ID + "-top-" + d.key).selectAll("line").data(d.values);
                    
                    errorTopSelect.transition().duration(750).call(errorbars.updateCaps, 'top', new_xScale, new_yScale);
                    
                    // Enter new error tops
                    errorTopSelect.enter().call(errorbars.caps, 'top', new_xScale, new_yScale, vm);
    
                    // Remove old error tops
                    errorTopSelect.exit().remove();
    
                    // Re-draw Error Bottom
                    let errorBottomSelect = vm.elements.plot.select("#error-" + vm.ID + "-bottom-" + d.key).selectAll("line").data(d.values);
                    
                    errorBottomSelect.transition().duration(750).call(errorbars.updateCaps, 'bottom', new_xScale, new_yScale);
                    
                    // Enter new error bottoms
                    errorBottomSelect.enter().call(errorbars.caps, 'bottom', new_xScale, new_yScale, vm);
    
                    // Remove old error bottoms
                    errorBottomSelect.exit().remove();
    
                    // Update all circles
                    let scatterSelect = vm.elements.plot.select("#scatter-" + vm.ID + "-" + d.key).selectAll("circle").data(d.values);
                    
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
                        .call(scatterPoints, new_xScale, new_yScale, vm.color);
    
                    // Remove old
                    scatterSelect.exit().remove();                        
                }
            });

            // Update legend
            vm.updateLegend();
            
            // Update Labels
            vm.updateLabels();
    
            // Add keys
            vm.removeLines();
        }
    }
}