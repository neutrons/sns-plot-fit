import * as d3 from 'd3';
import store from '../../../../store/index.js';

// The eventBus serves as the means to communicating between components.
import { eventBus } from '../../eventBus.js';

export const removePoint = {
    methods: {
        removePoint(index, name) {
            let vm = this;

            // console.log("Removing point: ", index, name);

            $("#myModal").modal('show')
    
            $("#btn-no-delete").on("click", function(){
                $("#btn-no-delete").off();
                $("#btn-yes-delete").off();
                $("#myModal").modal('hide');
            });

            $("#btn-yes-delete").on("click", function(){
    
                $("#btn-no-delete").off();
                $("#btn-yes-delete").off();

                eventBus.$emit('update-selected-data', index, name);

                // Remove point from stored dataset
                store.commit('removePoint', {name: name, index: index, dataType: vm.ID});
                $("#myModal").modal('hide');

            });
        }
    }
}