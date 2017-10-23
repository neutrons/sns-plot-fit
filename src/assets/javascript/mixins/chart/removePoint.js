import * as d3 from 'd3';
import store from '../../../../store/index.js';

export const removePoint = {
    methods: {
        removePoint(index, name, callback) {
            let vm = this;

            callback = callback || $.noop;

            // console.log("Removing point: ", index, name);

            let yes = function() {
                $("#btn-no-delete").off();
                $("#btn-yes-delete").off();
                
                // Remove point from current data
                // console.log(vm.dataNest);
                vm.dataNest.forEach(el => {
                    if (el.key === name)    el.values.splice(index,1);
                })

                // Remove point from stored dataset
                store.commit('removePoint', {name: name, index: index});

                return true;
            }

            $("#myModal").modal('show')
    
            $("#btn-no-delete").on("click", function(){
                $("#btn-no-delete").off();
                $("#btn-yes-delete").off();
                $("#myModal").modal('hide');
            });

            $("#btn-yes-delete").on("click", function(){
    
                $.when( yes() ).done(function() {
                    $("#myModal").modal('hide');
                    vm.updatePlot(vm.dataNest);
                    
                    callback();
                });
            });
        }
    }
}