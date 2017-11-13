import * as d3 from 'd3';

export const removeElements = {
    methods: {
        removeElements() {
            let vm = this;

            let newKeys = [];
            vm.dataNest.forEach(el => {
                let keyIndex = newKeys.indexOf(el.key);
                
                if( keyIndex === -1) {
                    newKeys.push(el.key);
                }
            })
            
            let delKeys = [];
    
            for (let i = 0, len = vm.prevKeys.length; i < len; i++) {
                let match = newKeys.indexOf( vm.prevKeys[i] );
    
                if ( match === -1) {
                    delKeys.push( vm.prevKeys[i] );
                }
            }
    
            // Remove any lines not in the dataNest
            delKeys.forEach(k => {
                vm.chart.g.select("#scatter-" + vm.ID + "-" + k).remove();
                vm.chart.g.select("#line-" + vm.ID + "-" + k).remove();
                vm.chart.g.select("#error-" + vm.ID + "-" + k).remove();
                vm.chart.g.select("#error-cap-top-" + vm.ID + "-" + k).remove();
                vm.chart.g.select("#error-cap-bottom-" + vm.ID + "-" + k).remove();
                vm.chart.g.select("#legend-" + vm.ID + "-" + k).remove();
            })
    
            // Update previous keys with current keys
            vm.prevKeys = _.clone(newKeys);
        }
    }
}