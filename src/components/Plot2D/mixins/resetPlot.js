import * as d3 from 'd3';

export const resetPlot = {
    methods: {
        resetPlot() {
            let vm = this;
            
            vm.elements.svg.transition().duration(750)
                .call(vm.zoom.transform, d3.zoomIdentity);
        }
    }
}