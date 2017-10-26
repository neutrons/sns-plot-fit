import * as d3 from 'd3';

export const changeScales = {
    methods: {
        changeScales(values) {
            let vm = this;
            
            vm.scale.x = values.xScale.copy();
            vm.scale.y = values.yScale.copy();
    
            // update scale types
            vm.scale.yType = values.yScaleType;
    
            // if theres a fit, update brush scale
            // if(vm.isFit) {
            //     vm.scale.x2 = values.xScale.copy();
            //     vm.scale.x2.range([0, vm.dimensions.w]);
            // }
            
            vm.scale.x.range([0, vm.dimensions.w]);
            vm.scale.y.range([vm.dimensions.h, 0]);
            
            // // update plot
            // my.update(plotData);
        }
    }
}