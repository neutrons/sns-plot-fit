import * as d3 from 'd3';

export const toggleEdit = {
    methods: {
        toggleEdit(choice) {
            let vm = this;

            // console.log(this.value);
            vm.toggleChoice = choice;

            if (vm.toggleChoice === 'zoom' || vm.brushObj.brushCount < 1) {
                // Toggle off all brushes
                for(let i = 0, len = vm.brushObj.brushes.length; i < len; i++) {
                    d3.select('#brush-'+i).on('.brush', null);
                    vm.elements.svg.selectAll('.overlay').style("pointer-events", "none");
                }
                
                // Remove Brush Cursor Styles
                // d3.select('.stitch-chart').style('cursor', 'move');
                vm.elements.zoom.select('.brushes').selectAll('.selection').style("cursor", "move");
                vm.elements.zoom.select('.brushes').selectAll('.overlay').style("cursor", "move");

                vm.elements.svg.select('.zoom').call(vm.zoom);
            } else if (vm.toggleChoice === 'brush') {
                vm.elements.svg.select('.zoom').on('.zoom', null);
                
                // Toggle on all brushes
                for(let i = 0, len = vm.brushObj.brushes.length; i < len; i++) {
                    vm.elements.zoom.selectAll('.overlay').style("pointer-events", "all");
                    vm.brushObj.brushes[i].brush(d3.select('#brush-'+i));
                }

                // Re-instate Brush Cursor Styles
                vm.elements.zoom.select('.brushes').selectAll('.selection').style("cursor", "move");
                vm.elements.zoom.select('.brushes').selectAll('.overlay').style("cursor", "crosshair");
            }

        }
    }
}

export const resetToggle = {
    methods: {
        resetToggle() {
            this.toggleChoice = 'zoom';
        }
    }
}