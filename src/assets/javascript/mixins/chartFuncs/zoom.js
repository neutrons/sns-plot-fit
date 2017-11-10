import * as d3 from 'd3';
import errorBottomY from './errorBottomY.js';

export const zoom = {
    methods: {
        zoomed(new_yScale, new_xScale) {
            let vm = this;

            // re-set line generator
            vm.updateLineGenerator(new_xScale, new_yScale);

            // re-scale axes and gridlines during zoom
            vm.updateAxes(new_xScale, new_yScale);
            vm.updateGrids(new_xScale, new_yScale);

            // re-draw scatter plot;
            vm.chart.g.selectAll(".dot")
                .call(vm.updateScatter, new_xScale, new_yScale);

            // re-draw line paths
            vm.chart.g.selectAll(".pointlines")
                .call(vm.updateLine);

            // re-draw error lines
            vm.chart.g.selectAll('.error-line')
                .call(vm.updateErrorLine, vm.scale.yType, new_xScale, new_yScale);

            // re-draw error caps
            vm.chart.g.selectAll('.error-cap-top')
                .call(vm.updateErrorCaps, 'top', new_xScale, new_yScale);

            vm.chart.g.selectAll('.error-cap-bottom')
                .call(vm.updateErrorCaps, 'bottom', new_xScale, new_yScale);

        }
    }
}