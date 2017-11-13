import * as d3 from 'd3'

export const addClipPath = {
    methods: {
        addClipPath(selection) {
            let vm = this;
            
            selection.append('defs').append('clipPath')
                .attr('id', 'clip-' + vm.ID)
                .append('rect')
                .attr('width', vm.dimensions.w)
                .attr('height', vm.dimensions.h);
        }
    }
}