import * as d3 from 'd3';
import errorBottomY from './errorBottomY.js';

function checkYType (d, yType) {
    if (yType === "Log(Y)") {
        return d.y - d.e > 0;
    } else {
        return true;
    }
}

let errorbar = {};

errorbar.caps = function (selection, direction, x, y, vm) {

    selection.append('line')
        .attr('class', function(d) {
            return direction === 'top' ? 'error-' + vm.ID + '-tick-top' : 'error-' + vm.ID + '-tick-bottom'
        })
        .filter( function(d) {
            return checkYType(d, vm.scale.yType);
        })
        .call(errorbar.updateCaps, direction, x, y)
        .style("stroke", function (d) {
            return d.color = vm.color(d.name);
        })
}

errorbar.updateCaps = function (selection, direction, x, y) {
    selection.attr('x1', function (d) {
            return x(d.x) - 4;
        })
        .attr('x2', function (d) {
            return x(d.x) + 4;
        })
        .attr('y1', function (d) {
            return direction === "top" ? y(d.y + d.e) : y(d.y - d.e);
        })
        .attr('y2', function (d) {
            return direction === "top" ? y(d.y + d.e) : y(d.y - d.e);
        });
}

errorbar.line = function (selection, x, y, vm) {
    selection.append('line')
        .attr('class', 'error error-' + vm.ID)
        .call(errorbar.updateLine, x, y, vm.scale.yType)
        .style("stroke", function (d) {
            return d.color = vm.color(d.name);
        });
}

errorbar.updateLine = function (selection, x, y, yType) {

    selection.attr('x1', function (d) {
            return x(d.x);
        })
        .attr('x2', function (d) {
            return x(d.x);
        })
        .attr('y1', function (d) {
            return y(d.y + d.e);
        })
        .attr('y2', function (d) {
            return errorBottomY(d, yType, y);
        });
}

export default errorbar;