export const initDimensions = {
    methods: {
        initDimensions() {
            let vm = this;
            let viewHeight;
            
            // Pull plot's parent container width, this will be used to scale the plot responsively
            var containerWidth = document.getElementById("plot-" + vm.ID).offsetWidth;
    
            if (vm.isFit) {
                vm.margin = {
                    top: 50,
                    right: 50,
                    bottom: 100, // adjusts margin for slider
                    left: 75
                };
                
                // View Height is calculated on a 16:9 aspect ratio
                // This is to properly adjust the plot to the container width
                // This is mostly used when the user adjusts the browser 
                // from small (mobile) to large (desktop) window sizes.
                viewHeight = containerWidth / (vm.dimensions.aspectW/vm.dimensions.aspectH);
                vm.dimensions.h = viewHeight - vm.margin.top - vm.margin.bottom;
            } else {
                vm.margin = {
                    top: 50,
                    right: 50,
                    bottom: 50,
                    left: 75
                };
    
                viewHeight = containerWidth / (vm.dimensions.aspectW/vm.dimensions.aspectH);
                vm.dimensions.h = viewHeight - vm.margin.top - vm.margin.bottom;
            }
    
            vm.dimensions.w = containerWidth - vm.margin.left - vm.margin.right;
    
            // Set viewbox for to enable responsive scaling for svg upon window resize
            vm.dimensions.viewbox = "0 0 " + containerWidth + " " + viewHeight;
        }
    }
}