import * as d3 from 'd3'

export const addClipPath = {
    methods: {
        addClipPath(selection) {
            let vm = this;

            let CP = vm.chart.svg.append('defs').append('clipPath');
            CP.attr('id', 'clip-' + vm.ID)
                .append('rect')
                .attr('width', vm.dimensions.w)
                .attr('height', vm.dimensions.h);
        }
    }
}