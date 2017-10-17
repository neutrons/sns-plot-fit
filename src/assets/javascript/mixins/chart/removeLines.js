import * as d3 from 'd3';

export const removeLines = {
    methods: {
        removeLines() {
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
                d3.select("#scatter-" + vm.ID + "-" + k).remove();
                d3.select("#line-" + vm.ID + "-" + k).remove();
                d3.select("#error-" + vm.ID + "-" + k).remove();
                d3.select("#error-" + vm.ID + "-top-" + k).remove();
                d3.select("#error-" + vm.ID + "-bottom-" + k).remove();
                d3.select("#legend-" + vm.ID + "-" + k).remove();
            })
    
            // Update previous keys with current keys
            vm.prevKeys = _.clone(newKeys);
        }
    }
}