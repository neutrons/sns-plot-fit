import * as d3 from 'd3';

export const adjustDomains = {
    methods: {
        adjustDomains() {
            let vm = this;
            
            vm.scale.x.domain(d3.extent(vm.plotData, function(d) { return d.x; })).nice();
            vm.scale.y.domain(d3.extent(vm.plotData, function(d) { return d.y; })).nice();
        }
    }
}