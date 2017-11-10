import * as d3 from 'd3';

export const toggleZoomBrush = {
    methods: {
        toggleEdit(choice) {
            let vm = this;

            // console.log(this.value);
            vm.toggleChoice = choice;

            if (vm.toggleChoice === 'zoom' || vm.brushObj.brushCount < 1) {
                // Toggle off all brushes
                for(let i = 0, len = vm.brushObj.brushes.length; i < len; i++) {
                    d3.select('#brush-'+i).on('.brush', null);
                    vm.chart.svg.selectAll('.overlay').style("pointer-events", "none");
                }
                
                // Remove Brush Cursor Styles
                // d3.select('.stitch-chart').style('cursor', 'move');
                vm.chart.g.select('.brushes').selectAll('.selection').style("cursor", "move");
                vm.chart.g.select('.brushes').selectAll('.overlay').style("cursor", "move");

                vm.chart.g.select('.zoom').call(vm.zoom);
            } else if (vm.toggleChoice === 'brush') {
                vm.chart.g.select('.zoom').on('.zoom', null);
                
                // Toggle on all brushes
                for (let i = 0, len = vm.brushObj.brushes.length; i < len; i++) {
                    vm.chart.g.select('.brushes').selectAll('.overlay').style("pointer-events", "all");
                    vm.brushObj.brushes[i].brush(d3.select('#brush-' + i));
                }

                // Re-instate Brush Cursor Styles
                vm.chart.g.select('.brushes').selectAll('.selection').style("cursor", "move");
                vm.chart.g.select('.brushes').selectAll('.overlay').style("cursor", "crosshair");
            }
        },
        resetToggle() {
            this.toggleChoice = 'zoom';
        }
    }
}