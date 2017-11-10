import * as d3 from 'd3';

export const linePath = {
    methods: {
        updateLine(selection, t, key) {    
            let vm = this;

            t = t || d3.transition().duration(0);

            // ENTER
            selection.enter()
                .append('path')
            .attr("class", "pointlines")
            .transition(t)
            .attr("d", vm.line)
            .style("stroke", (d) => {
                return d.color = vm.color(key);
            });
              
              // UPDATE
              selection.transition(t).attr("d", vm.line);
        }
    }
}