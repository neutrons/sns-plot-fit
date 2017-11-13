import * as d3 from 'd3';
import tooltip from '../../../assets/javascript/mixins/chartFuncs/tooltip.js';
import scatterPoints from '../../../assets/javascript/mixins/chartFuncs/scatter.js';

import store from '../../../store/index.js';

export const updateChart = {
    methods: {
        updateChart(newData) {
            let vm = this;
            // Set transition for update animatino
            let trans = d3.transition().duration(750);

            // console.log("UPDATE Chart:", newData);

            // First update data to new data
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

            //Add a Line path Function
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