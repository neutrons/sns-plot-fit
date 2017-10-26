import getContainerWidth from '../../../assets/javascript/mixins/chart/getContainerWidth.js';
import getViewHeight from '../../../assets/javascript/mixins/chart/getViewHeight.js';

export const initDimensions = {
    methods: {
        initDimensions() {
            let vm = this;
            
            var containerWidth = document.getElementById("plot-2D").offsetWidth;
            var viewHeight = containerWidth / (16/9);

            var containerWidth = getContainerWidth(vm);
            var viewHeight = getViewHeight(vm, containerWidth);

            vm.dimensions.h = viewHeight - vm.margin.top - vm.margin.bottom;
            vm.dimensions.w = containerWidth - vm.margin.left - vm.margin.right;

            // Set legend dimensions
            vm.dimensions.lw = 25;
            vm.dimensions.lh = vm.dimensions.h;

            vm.dimensions.viewbox = "0 0 " + containerWidth + " " + viewHeight;
        }
    }
}