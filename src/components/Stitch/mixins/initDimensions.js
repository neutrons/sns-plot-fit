import * as d3 from 'd3';

export const initDimensions = {
    methods: {
        initDimensions() {
            let vm = this;

            // Set plot dimensions
            var containerWidth = document.getElementById("plot-" + vm.ID).offsetWidth; // Pull plot's parent container width, this will be used to scale the plot responsively

            let viewHeight = containerWidth / (vm.dimensions.aspectW/vm.dimensions.aspectH);

            vm.dimensions.h = viewHeight - vm.margin.top - vm.margin.bottom;

            vm.dimensions.w = containerWidth - vm.margin.left - vm.margin.right;

            vm.dimensions.viewbox = "0 0 " + containerWidth + " " + viewHeight;
        }
    }
}