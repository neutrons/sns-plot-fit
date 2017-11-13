import * as d3 from 'd3';

export const resetChart = {
    methods: {
        resetChart() {
            let vm = this;
            
            vm.chart.g.select('.zoom')
                .transition()
                .duration(750)
                .call(vm.zoom.transform, d3.zoomIdentity);
        },
        initResetButton() {
            let vm = this;

            let btn = d3.select('#chart-' + vm.ID).append('button');
        
            btn.attr('class', 'btn btn-default btn-xs reset-btn')
                .text('Reset plot')
                .style('position', 'absolute')
                .style('top', vm.margin.top + 45 + 'px')
                .style('left', vm.margin.left + 25 + 'px')
                .on('click', vm.resetChart);
        }
    }
}