import * as d3 from 'd3'

export const addSVG = {
    methods: {
        addSVG() {
            let vm = this;

            return d3.select('#chart-' + vm.ID).append('svg')
                .attr('viewBox', vm.dimensions.viewbox)
                .attr('perserveAspectRatio','xMidYMid meet')
                .attr('class', 'chart chart-' + vm.ID)
                .attr('width', vm.dimensions.w + vm.margin.left + vm.margin.right)
                .attr('height', vm.dimensions.h + vm.margin.top + vm.margin.bottom);
        }
    }
}