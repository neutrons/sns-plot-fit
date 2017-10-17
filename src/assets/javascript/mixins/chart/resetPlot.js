import * as d3 from 'd3';

export const resetPlot = {
    methods: {
        resetPlot(selection) {
            let vm = this;
            
            selection.transition().duration(750).call(vm.zoom.transform, d3.zoomIdentity);
        }
    }
}