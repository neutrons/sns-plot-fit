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
        },
        filterZeros(choice) {

            let temp = _.cloneDeep(this.dataNest);

            temp.forEach(el => {
                if (choice === 'both') {
                    el.values = el.values.filter(d => {
                        return d.x > 0 && d.y > 0;
                    });
                } else {
                    el.values = el.values.filter(d => {
                        return d[choice] > 0;
                    })
                };
            });

            return temp;
        },
        checkScaleType() {
            let temp = [];

            if (this.scale.xType === 'Log(X)' && this.scale.yType === 'Log(Y)') {
                temp = this.filterZeros('both');
            } else if (this.scale.xType === 'Log(X)') {
                temp = this.filterZeros('x');
            } else if (this.scale.yType === 'Log(Y)') {
                temp = this.filterZeros('y');
            } else {
                temp = _.cloneDeep(this.dataNest);
            }

            return temp;
        }
    }
}