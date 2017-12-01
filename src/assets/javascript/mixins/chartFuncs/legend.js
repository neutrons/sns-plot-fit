import * as d3 from 'd3';

export const legend = {
    methods: {
        updateLegend(data) {
            let vm = this;
            
            let keys = [];
            data.forEach(el => { keys.push(el.key); });

            let w = document.getElementById('chart-' + vm.ID).offsetWidth;
            
            var legend = vm.chart.g.select("#legend-" + vm.ID);
            
            var legendBox = legend.selectAll("rect").data(keys, function(d) { return d; });
    
            // EXIT legend box
            legendBox.exit().remove();
        
            // ENTER legend box
            legendBox.enter()
                .append("rect")
                .merge(legendBox)
                .attr("x", function(d,i) {
                    return w > 1400 ? vm.dimensions.w - vm.margin.right*5 + 'px' :
                            w > 1000 ? vm.dimensions.w - vm.margin.right*4.5 + 'px' : vm.dimensions.w - vm.margin.right*3 + 'px';
                })
                .attr("y", function(d,i) { 
                    return w > 1400 ? vm.margin.top + i * 25 + 'px' :
                           w > 1000 ? vm.margin.top/1.5 + i * 25 + 'px' : vm.margin.top/2 + i * 20 + 'px';
                })
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", function (d, i) {
                    return vm.color(d);
                })
                .attr("height", "8px")
                .attr("width", "8px");
    
            var legendText = legend.selectAll("text").data(keys, function(d) {return d;});
    
            // EXIT legend text
            legendText.exit().remove();
        
            // ENTER legend text
            legendText.enter()
                .append("text")
                .merge(legendText)
                .attr("x", function(d,i) {
                    return w > 1400 ? vm.dimensions.w - vm.margin.right*5 + 15 + 'px' :
                           w > 1000 ? vm.dimensions.w - vm.margin.right*4.5 + 15 + 'px' : vm.dimensions.w - vm.margin.right*3 + 15 + 'px';
                })
                .attr("y", function(d,i) { 
                    return w > 1400 ? (vm.margin.top + 8) + i * 25 + 'px' :
                           w > 1000 ? (vm.margin.top + 12)/1.5 + i * 25 + 'px' : (vm.margin.top + 14)/2 + i * 20 + 'px';
                })
                .style("fill", function (d,i) {
                    return vm.color(d);
                })
                .style("font-size", "12px")
                .style("font-weight", "bold")
                .text(function (d) {
                    return d;
                });
        }
    }
}