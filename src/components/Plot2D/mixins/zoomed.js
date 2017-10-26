import * as d3 from 'd3';

export const zoomed = {
    methods: {
        zoomed() {
            let vm = this;

            // re-scale axes during zoom
            vm.elements.axis.select(".axis--y").transition()
            .duration(50)
            .call(vm.axis.y.scale(d3.event.transform.rescaleY(vm.scale.y)));

            vm.elements.axis.select(".axis--x").transition()
                .duration(50)
                .call(vm.axis.x.scale(d3.event.transform.rescaleX(vm.scale.x)));

            // Transform hexagons depending on the zoom
            vm.elements.plot.selectAll(".hexagon")
                .attr("transform", d3.event.transform); 
        }
    }
}