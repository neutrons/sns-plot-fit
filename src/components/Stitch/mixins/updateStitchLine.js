import * as d3 from 'd3';

export const updateStitchLine = {
    methods: {
        updateStitchLine() {
            let vm = this;

            if (!d3.select("#stitched-line").empty()) {
                
                    d3.select("#stitched-line").select("path")
                        .transition().duration(750)
                        .attr("d", vm.line);       
            }
        }
    }
}