import * as d3 from 'd3';

export const adjustDomains = {
    methods: {
        adjustDomains() {
            let vm = this;

            // Set scales
            let extents = {
                x: d3.extent(vm.plotData, function(d) { return d.x; }),
                y: d3.extent(vm.plotData, function(d) { return d.y; }),
            };

            for (let key in extents) {

                if (extents[key][0] === extents[key][1]) {
                    console.log("Same extents " + key);
                    
                    extents[key][0] -= 1;
                    extents[key][1] += 1;
                }
            }
            
            vm.scale.x.domain(extents.x).nice();
            vm.scale.y.domain(extents.y).nice();
        }
    }
}