import * as d3 from 'd3';

export const initScales = {
    methods: {
        initScales() {
            let vm = this;
            
            vm.scale.x = d3.scaleLinear().range([0, vm.dimensions.w]);
            vm.scale.y = d3.scaleLinear().range([vm.dimensions.h, 0]);

            // Set scale domains
            vm.scale.x.domain(d3.extent(vm.plotData, function(d) { return d.qx;}));
            vm.scale.y.domain(d3.extent(vm.plotData, function(d) { return d.qy;}));
        }
    }
}