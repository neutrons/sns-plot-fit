import * as d3 from 'd3'

export const initScales = {
    methods: {
        initScales() {
            let vm = this;

            // Set scales
            // let xExtent = d3.extent(vm.plotData, function(d) { return d.x; });
            // let yExtent = d3.extent(vm.plotData, function(d) { return d.y; });

            // if (xExtent[0] === xExtent[1]) {
            //     console.log("Same extent x");
            //     xExtent[0] -= 1;
            //     xExtent[1] += 1;
            // }

            // if (yExtent[0] === yExtent[1]) {
            //     console.log("Same extent y");
            //     yExtent[0] -= 1;
            //     yExtent[1] += 1;
            // }

            vm.scale.x = vm.plotParameters.scales.x;
            vm.scale.x.range([0,vm.dimensions.w]);
            // vm.scale.x.domain(xExtent);
            
            vm.scale.y = vm.plotParameters.scales.y;
            vm.scale.y.range([vm.dimensions.h, 0]);
            // vm.scale.y.domain(yExtent);

            this.scale.xType = vm.plotParameters.scales.xType;
            this.scale.yType = vm.plotParameters.scales.yType;

            vm.adjustDomains();

            // Set Axes
            vm.axis.x = d3.axisBottom(vm.scale.x).ticks(10);
            vm.axis.y = d3.axisLeft(vm.scale.y).ticks(10);
            vm.axis.xGrid = d3.axisBottom(vm.scale.x).ticks(10).tickSize(-vm.dimensions.h).tickFormat("");
            vm.axis.yGrid = d3.axisLeft(vm.scale.y).ticks(10).tickSize(-vm.dimensions.w).tickFormat("");

            // Set Color Scale
            vm.color = d3.scaleOrdinal(d3.schemeCategory20)
                .domain(vm.plotParameters.colorDomain);

        }
    }
}