import * as d3 from 'd3';

export const changeScales = {
    methods: {
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