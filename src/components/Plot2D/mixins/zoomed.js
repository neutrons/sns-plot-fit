import * as d3 from 'd3';

export const zoomed = {
    methods: {
        zoomed() {
            let vm = this;

            // re-scale axes during zoom
            vm.chart.g.select(".axis--y")
                .call(vm.axis.y.scale(d3.event.transform.rescaleY(vm.scale.y)));

            vm.chart.g.select(".axis--x")
                .call(vm.axis.x.scale(d3.event.transform.rescaleX(vm.scale.x)));

            // Transform hexagons depending on the zoom
            vm.chart.g.selectAll(".hexagon")
                .attr("transform", d3.event.transform); 
        }
    }
}