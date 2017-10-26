import * as d3 from 'd3';

export default function(vm, xScale, yScale) {
    vm.line = d3.line()
        .defined(function(d) { 
            if(vm.scale.yType === 'Log(Y)') {
                return d.y > 0;
            } else {
                return d;
            }
        })
        .x(function (d) {
            return xScale(d.x);
        })
        .y(function (d) {
            return yScale(d.y);
        });
}