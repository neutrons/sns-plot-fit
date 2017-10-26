export const removePointExtend = {
    methods: {
        removePointExtend(index, name) {
            let vm = this;

            vm.removePoint(index,name, function() {

                if (vm.isFit) { 
                    vm.updateSlider(); 
                    vm.updateFitLine(); 
                }

            });
            
        }
    }
}