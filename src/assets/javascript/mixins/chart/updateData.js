import * as d3 from 'd3';

export const updateData = {
    methods: {
        updateData(newData) {
            let vm = this;

            // Update Plot Data
            vm.plotData = newData;
            vm.plotData = vm.plotData.filter((d) => Number.isFinite(d.y) && Number.isFinite(d.x));
    
            // Nest the entries by name
            vm.dataNest = d3.nest()
                .key(function (d) {
                    return d.name;
                })
                .entries(vm.plotData);
        }
    }
}