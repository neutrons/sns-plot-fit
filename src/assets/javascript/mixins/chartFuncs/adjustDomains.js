import * as d3 from 'd3';
import extent from './extent.js';

export const adjustDomains = {
    methods: {
        adjustDomains(data) {
            let vm = this;
                
            let xExtent = extent(data, 'x');
            let yExtent = extent(data, 'y');
            
            vm.scale.x.domain(xExtent).nice();
            vm.scale.y.domain(yExtent).nice();
        }
    }
}