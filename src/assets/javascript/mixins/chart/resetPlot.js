import * as d3 from 'd3';

export const resetPlot = {
    methods: {
        resetPlot(selection) {
            let vm = this;
            
            vm.elements.zoom.select('.zoom').transition().duration(750)
                .call(vm.zoom.transform, d3.zoomIdentity);
        }
    }
}