import * as d3 from 'd3';
import extent from './extent.js';

export const scales = {
    methods: {
        initScales() {
            let vm = this;

            // Set scales
            let xExtent = extent(vm.dataNest, 'x');
            let yExtent = extent(vm.dataNest, 'y');

            vm.scale.x = vm.plotParameters.scale.x;
            vm.scale.xType = vm.plotParameters.scale.xType;
            vm.scale.x.range([0,vm.dimensions.w]);
            vm.scale.x.domain(xExtent);
            
            vm.scale.y = vm.plotParameters.scale.y;
            vm.scale.yType = vm.plotParameters.scale.yType;
            vm.scale.y.range([vm.dimensions.h, 0]);
            vm.scale.y.domain(yExtent);
        },
        changeScales(values) {
            let vm = this;
                        
            vm.scale.x = values.x.copy();
            vm.scale.y = values.y.copy();
    
            // update scale types
            vm.scale.xType = values.xType;
            vm.scale.yType = values.yType;
            
            vm.scale.x.range([0, vm.dimensions.w]);
            vm.scale.y.range([vm.dimensions.h, 0]);
        }
    }
}