import getContainerWidth from './getContainerWidth.js';
import getViewHeight from './getViewHeight.js';

export const initDimensions = {
    methods: {
        initDimensions(callback = () => {}) {
            let vm = this;
            
            // Pull plot's parent container width, this will be used to scale the plot responsively
            // var containerWidth = document.getElementById("plot-" + vm.ID).offsetWidth;
            // let viewHeight = containerWidth / (vm.dimensions.aspectW/vm.dimensions.aspectH);
            var containerWidth = getContainerWidth(vm.ID);

            // View Height is calculated on a 16:9 aspect ratio
            // This is to properly adjust the plot to the container width
            // This is mostly used when the user adjusts the browser 
            // from small (mobile) to large (desktop) window sizes.
            var viewHeight = getViewHeight(vm.dimensions.aspectW, vm.dimensions.aspectH, containerWidth);
    
            callback(viewHeight);
    
            vm.dimensions.w = containerWidth - vm.margin.left - vm.margin.right;
    
            // Set viewbox for to enable responsive scaling for svg upon window resize
            vm.dimensions.viewbox = "0 0 " + containerWidth + " " + viewHeight;
        }
    }
}