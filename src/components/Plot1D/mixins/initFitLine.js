import * as d3 from 'd3';

export const initFitLine = {
    methods: {
        initFitLine() {
            let vm = this;
            
            // Add fitted line
            vm.elements.plot.append("g")
                .attr("id", "fit-line")
                .append("path")
                .attr("clip-path", "url(#clip-" + vm.ID + ")")
                .attr("class", "fitted-line");
        }
    }
}