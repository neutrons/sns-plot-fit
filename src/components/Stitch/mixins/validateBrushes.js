import * as d3 from 'd3';
import _ from 'lodash';

// The eventBus serves as the means to communicating between components.
import { eventBus } from '../../../assets/javascript/eventBus';

export const validateBrushes = {
    methods: {
        validateBrushes() {
            let vm = this;

            // console.log(brushObj.brushSelections);
            // console.log(Object.keys(brushObj.brushSelections));
            let totalBrushes = Object.keys(vm.brushObj.brushSelections).length;
        
            if (totalBrushes === 0) {
                console.log("No brushes to select data.");
    
                // Emit error message pop-up
                let errorMsg = "<strong>Error!</strong> No brushes to select data. Draw brushes.";
                eventBus.$emit('error-message', errorMsg, 'danger');
    
                return true;
            } else if (totalBrushes !== vm.brushObj.brushCount) {
                console.log("There are " + (vm.brushObj.brushCount + 1) + " lines. You must have (n-1) = " + vm.brushObj.brushCount + " number of brushes.");
    
                // Emit error message pop-up
                let errorMsg = "<strong>Error!</strong>" + " There are " + (vm.brushObj.brushCount + 1) + " lines. You must have (n-1) = " + vm.brushObj.brushCount + " number of brushes. Redraw brushes.";
                eventBus.$emit('error-message', errorMsg, 'danger');
    
                return true;
            } else {
                return false;
            }
        }
    }
}

export const validateSelections = {
    methods: {
        validateSelections(selected) {
            let vm = this;

            let lineNames = [];
            
            for(let i = 0, len = vm.dataNest.length; i < len; i++) {
                lineNames.push( vm.dataNest[i].key );
            }

            // First make sure only 2 lines and only 2 lines are selected per brush
            for( let i = 0, len = selected.length; i < len; i++ ) {
                let tempBrush = selected[i];

                // console.log("Temp brush", tempBrush);
                if (tempBrush.length - 1 !== 2) {
                    console.log("Make sure a brush selects 2 and only 2 lines.")

                    // Emit error message pop-up
                    let errorMsg = "<strong>Error!</strong> Make sure a brush selects 2 and only 2 lines. Redraw brushes.";
                    eventBus.$emit('error-message', errorMsg, 'danger');

                    return true;
                }
            }

            // Reduce keys to a non-nested array
            let keys = [];
            
            for ( let i = 0, len = selected.length; i < len; i++) {
                for ( let j = 0, len = selected[i].length - 1; j < len; j++) {
                    
                    // Check that each brush selects more than one point per curve
                    // Leverberg Marquardt cannot fit arrays of length = 1
                    if (selected[i][j][2].x.length < 2) {
                        console.log("Select more than 1 data point per curve.");
                        
                        // Emit error message pop-up
                        let errorMsg = "<strong>Error!</strong> Select more than 1 data point per curve. Redraw brushes.";
                        eventBus.$emit('error-message', errorMsg, 'danger');
                        
                        return true;
                    }

                    keys.push(selected[i][j][0]);
                }
            }

            // If none of the items in keys matches to lineNames,
            // set to true because not all lines have been selected in brushes
            for (let i = 0, len = lineNames.length; i < len; i++) {
                if (keys.indexOf(lineNames[i]) === -1) {
                    console.log(lineNames[i] + " was not selected. Make sure each line is selected.");

                    // Emit error message pop-up
                    let errorMsg = "<strong>Error!</strong> " + lineNames[i] + " was not selected. Make sure each line is selected. Redraw brushes.";
                    eventBus.$emit('error-message', errorMsg, 'danger');

                    return true;
                }
            }

            return false;
        }
    }
}