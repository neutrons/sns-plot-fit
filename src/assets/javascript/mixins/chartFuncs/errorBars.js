import * as d3 from 'd3';
import errorBottomY from './errorBottomY.js';

export const errorBars = {
    methods: {
        errorCaps(selection, direction, x = this.scale.x, y = this.scale.y, t = d3.transition().duration(0)) {
            let vm = this;

            // ENTER
            selection.enter().append('line')
                .attr('class', (d) => { return direction === 'top' ? 'error-cap-top error-cap-top-' + vm.ID : 'error-cap-bottom error-cap-bottom-' + vm.ID })
                .filter( (d) => { return checkYType(d, vm.scale.yType)})
                .call(vm.updateErrorCaps, direction, x, y, t)
                .style("stroke",  (d) => { return d.color = vm.color(d.name)})
        },
        updateErrorCaps(selection, direction, x = this.scale.x, y = this.scale.y, t = d3.transition().duration(0)) {
            let vm = this;
            
            // UPDATE
            selection.transition(t)
                    .attr('x1', (d) => { return x(d.x) - 4})
                    .attr('x2', (d) => { return x(d.x) + 4})
                    .attr('y1', (d) => { return direction === 'top' ? y(d.y + d.e) : y(d.y - d.e)})
                    .attr('y2', (d) => { return direction === 'top' ? y(d.y + d.e) : y(d.y - d.e)});

            // EXIT
            selection.exit().remove();
        },
        errorbarLine(selection, x = this.scale.x, y = this.scale.y, t = d3.transition().duration(0)) {
            let vm = this;

            // ENTER
            selection.enter()
                .append('line')
                .attr('class', 'error-line error-line-' + vm.ID)
                .call(vm.updateErrorLine, vm.scale.yType, x, y, t)
                .style("stroke", (d) => { return d.color = vm.color(d.name)});
        },
        updateErrorLine(selection, yType, x = this.scale.x, y = this.scale.y, t = d3.transition().duration(0)) {
            let vm = this;
            
            // UPDATE
            selection.transition(t)
                .attr('x1', (d) => { return x(d.x)})
                .attr('x2', (d) => { return x(d.x)})
                .attr('y1', (d) => { return y(d.y + d.e)})
                .attr('y2', (d) => { return errorBottomY(d, yType, y)});
            
            // EXIT
            selection.exit().remove();
        }
    }
}

function checkYType (d, yType) {
    if (yType === "Log(Y)") {
        return d.y - d.e > 0;
    } else {
        return true;
    }
}