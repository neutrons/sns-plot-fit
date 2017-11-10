import * as d3 from 'd3';

export const resetChart = {
    methods: {
        resetChart() {
            let vm = this;
            
            vm.chart.g.transition().duration(750)
                .call(vm.zoom.transform, d3.zoomIdentity);
        }
    }
}