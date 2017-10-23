// export const removePointExtend = {
//     methods: {
//         removePointExtend(index, name) {
//             let vm = this;

//             vm.removePoint(index,name, function(cb) {

//                 $("#btn-yes-delete").on("click", function(){
    
//                     $.when( cb() ).done(function() {
//                         $("#myModal").modal('hide');
//                         vm.updatePlot(vm.dataNest);
//                         if (vm.isFit) { vm.updateSlider(); vm.updateFitLine(); }
//                     });
//                 });
//             });
            
//         }
//     }
// }

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