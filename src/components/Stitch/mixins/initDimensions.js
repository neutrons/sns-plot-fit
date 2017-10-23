import getContainerWidth from '../../../assets/javascript/mixins/chart/getContainerWidth.js';
import getViewHeight from '../../../assets/javascript/mixins/chart/getViewHeight.js';

export const initDimensions = {
    methods: {
        initDimensions() {
            let vm = this;

            // Set plot dimensions
            var containerWidth = getContainerWidth(vm);
            var viewHeight = getViewHeight(vm, containerWidth);

            vm.dimensions.h = viewHeight - vm.margin.top - vm.margin.bottom;

            vm.dimensions.w = containerWidth - vm.margin.left - vm.margin.right;

            vm.dimensions.viewbox = "0 0 " + containerWidth + " " + viewHeight;
        }
    }
}