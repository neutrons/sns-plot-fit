import * as d3 from 'd3';
import extent from './extent.js';

export const adjustDomains = {
    methods: {
        adjustDomains() {
            let vm = this;
                
            let xExtent = extent(vm.dataNest, 'x');
            let yExtent = extent(vm.dataNest, 'y');
            
            vm.scale.x.domain(xExtent).nice();
            vm.scale.y.domain(yExtent).nice();
        }
    }
}