import * as d3 from 'd3';
import store from '../../../../store/index.js';
import tooltip from './tooltip.js';

export const updateChart = {
    methods: {
        updateChart(newData) {
            let vm = this;
            let trans = d3.transition().duration(750);

            // First update plot data to new data
            vm.dataNest = newData;
    
            // Then adjust scale's domain whenver new data is added
            vm.adjustDomains();           
    
            // Then rescale to zoom's scale
            let t = d3.zoomTransform( vm.chart.g.select('.zoom').node());
            let new_yScale = t.rescaleY(vm.scale.y); 
            let new_xScale = t.rescaleX(vm.scale.x);
            
            // Adjust axis and gridline labels
            vm.updateAxes(new_xScale, new_yScale, trans);
            vm.updateGrids(new_xScale, new_yScale, trans);

            //Add a Line Plot Function
            vm.updateLineGenerator(new_xScale, new_yScale);

            // Add and update data
            vm.dataNest.forEach(function (d, i) {

                // Add new elements if nothing exists
                if (d3.select("#line-" + vm.ID + "-" + d.key).empty()) {
                    
                    // Add line path
                    vm.chart.g.select('#line-' + vm.ID)
                        .append('g')
                            .attr('id', 'line-' + vm.ID + '-' + d.key)
                            .selectAll('path')
                            .data([d.values])
                            .call(vm.updateLine, trans, d.key);
                    
                    // Add error lines
                    let error = vm.chart.g.select('#error-' + vm.ID);
                    
                    error.append("g").attr("id", "error-" + vm.ID + "-" + d.key)
                        .selectAll('.error-line')
                        .data(d.values)
                        .call(vm.errorbarLine, new_xScale, new_yScale);
                    
                    // Add error cap top
                   error.append("g").attr("id", "error-cap-top-" + vm.ID + '-' + d.key)
                            .selectAll(".error-cap-top")
                            .data(d.values)
                            .call(vm.errorCaps, 'top', new_xScale, new_yScale);
                    
                    // Add error cap bottom
                    error.append("g").attr("id", "error-cap-bottom-" + vm.ID + '-' + d.key)
                            .selectAll(".error-cap-bottom")
                            .data(d.values)
                            .call(vm.errorCaps, 'bottom', new_xScale, new_yScale);
    
                    // Add scatter points
                    vm.chart.g.select('#scatter-' + vm.ID)
                        .append("g").attr('id', 'scatter-' + vm.ID + '-' + d.key)
                        .selectAll("circle")
                        .data(d.values)
                        .call(vm.updateScatter, new_xScale, new_yScale, trans);
                            
                } else {

                    // Update line paths
                    vm.chart.g.select('#line-' + vm.ID + '-' + d.key)
                        .selectAll('path')
                        .data([d.values])
                        .call(vm.updateLine, trans);
                    
                    // Update error Line
                    vm.chart.g.select('#error-' + vm.ID + '-' + d.key)
                        .selectAll('.error-line')
                        .data(d.values)
                        .call(vm.updateErrorLine, vm.scale.yType, new_xScale, new_yScale, trans);

                    // Update error cap Top
                    vm.chart.g.select("#error-cap-top-" + vm.ID + "-" + d.key)
                        .selectAll("line")
                        .data(d.values)
                        .call(vm.updateErrorCaps, 'top', new_xScale, new_yScale, trans)

                    // Update error cap bottom
                    vm.chart.g.select("#error-cap-bottom-" + vm.ID + "-" + d.key)
                        .selectAll("line")
                        .data(d.values)
                        .call(vm.updateErrorCaps, 'bottom', new_xScale, new_yScale, trans)
                        
                    // Update scatter
                    vm.chart.g.select('#scatter-' + vm.ID + '-' + d.key)
                        .selectAll('circle')
                        .data(d.values)
                        .call(vm.updateScatter, new_xScale, new_yScale, trans);                   
                }
            });

            // Update legend
            vm.updateLegend();
            
            // Update Labels
            vm.updateLabels();
    
            // Add keys
            vm.removeElements();
        }
    }
}