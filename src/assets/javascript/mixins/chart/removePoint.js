import * as d3 from 'd3';
import store from '../../../../store/index.js';

export const removePoint = {
    methods: {
        removePoint(index, name) {
            let vm = this;
            
            function deleteConfirm(callback){
                $("#myModal").modal('show')
                
                $("#btn-yes-delete").on("click", function(){
                    callback(true);
                    $("#myModal").modal('hide');
                });
        
                $("#btn-no-delete").on("click", function(){
                    callback(false);
                    $("#myModal").modal('hide');
                });
            };

            
            deleteConfirm( function(confirm){
                if (confirm){
                    $("#btn-no-delete").off();
                    $("#btn-yes-delete").off();
                    
                    // Remove point from current data
                    vm.plotData.splice(index, 1);
    
                    // Remove point from stored dataset
                    store.commit('removePoint', {name: name, index: index});
    
                    vm.updatePlot(vm.plotData);
                    return;
                } else {
                    $("#btn-no-delete").off();
                    $("#btn-yes-delete").off();
                    
                    return;
                }
            });
            
            return;
        }
    }
}