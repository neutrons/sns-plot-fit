import * as d3 from 'd3';
import errorBottomY from './errorBottomY.js';
import setLineGenerator from './setLineGenerator.js';

export const zoomed = {
    methods: {
        zoomed(new_yScale, new_xScale) {
            let vm = this;

            // re-set line generator
            setLineGenerator(vm, new_xScale, new_yScale);

            // re-scale axes and gridlines during zoom
            vm.elements.axis.select(".axis--y").transition()
                .duration(50)
                .call(vm.axis.y.scale(new_yScale));

            vm.elements.axis.select(".axis--x").transition()
                .duration(50)
                .call(vm.axis.x.scale(new_xScale));

            vm.elements.axis.select(".gridline--y").transition()
                .duration(50)
                .call(vm.axis.yGrid.scale(new_yScale));
            
            vm.elements.axis.select(".gridline--x").transition()
                .duration(50)
                .call(vm.axis.xGrid.scale(new_xScale));

            // re-draw scatter plot;
            vm.elements.plot.selectAll("circle")
                .attr("cy", function (d) {
                    return new_yScale(d.y);
                })
                .attr("cx", function (d) {
                    return new_xScale(d.x);
                });           

            vm.elements.plot.selectAll(".pointlines")
                .attr("d", vm.line);

            // Re-draw error
            vm.elements.plot.selectAll('.error-' + vm.ID)
                .attr('x1', function (d) {
                    return new_xScale(d.x);
                })
                .attr('x2', function (d) {
                    return new_xScale(d.x);
                })
                .attr('y1', function (d) {
                    return new_yScale(d.y + d.e);
                })
                .attr('y2', function (d) {
                    return errorBottomY(d, vm.scale.yType, new_yScale);
                });
            
            // re-draw error tick top
            vm.elements.plot.selectAll(".error-" + vm.ID + "-tick-top")
                .attr('x1', function (d) {
                    return new_xScale(d.x) - 4;
                })
                .attr('x2', function (d) {
                    return new_xScale(d.x) + 4;
                })
                .attr('y1', function (d) {
                    return new_yScale(d.y + d.e);
                })
                .attr('y2', function (d) {
                    return new_yScale(d.y + d.e);
                });

            // re-draw error tick bottom
            vm.elements.plot.selectAll(".error-" + vm.ID + "-tick-bottom")
                .filter( function(d) {
                    if(vm.scale.yType === "Log(Y)") {
                        return d.y - d.e > 0;
                    } else {
                        return true;
                    }
                })
                .attr('x1', function (d) {
                    return new_xScale(d.x) - 4;
                })
                .attr('x2', function (d) {
                    return new_xScale(d.x) + 4;
                })
                .attr('y1', function (d) {
                    return new_yScale(d.y - d.e);
                })
                .attr('y2', function (d) {
                    return new_yScale(d.y - d.e);
                });
        }
    }
}