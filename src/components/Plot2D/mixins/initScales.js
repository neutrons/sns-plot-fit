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

            // Create axis generator
            vm.axis.x = d3.axisBottom(vm.scale.x).ticks(10);
            vm.axis.y = d3.axisLeft(vm.scale.y).ticks(10);
        }
    }
}