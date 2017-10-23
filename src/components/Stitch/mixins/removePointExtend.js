// export const removePointExtend = {
//     methods: {
//         removPointExtend(index, name) {
//             let vm = this;

//             vm.removePoint(index, name, function(cb) {

//                 $("#btn-yes-delete").on("click", function(){
    
//                     $.when( cb() ).done(function() {
//                         // Remove point from stored dataset
//                         $("#myModal").modal('hide');
//                         vm.updatePlot(vm.dataNest);
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

            vm.removePoint(index, name);
        }
    }
}