import * as d3 from 'd3';
import $ from 'jquery';
import axios from 'axios';
import { eventBus } from '../../../assets/javascript/eventBus';

export const saveStitchLine = {
    methods: {
        saveStitchLine() {
            let vm = this;

            vm.saveConfirm( function(confirm){
                if (confirm){
                    $("#cancel-save-btn").off();
                    $("#save-btn").off();
                    
                    let filename = $('#file-name-input').val();
                    // console.log("Saving the file name: " + filename + "_Iq.txt");
                    $("#file-name-input").val('');
                    
                    
                    // console.log("Stitch Line Data:", stitchLineData);
                    // console.log("Calling axios.post to save new data file");
                    
                    axios.post('/external/save', {
                        id: filename + '_Iq.txt',
                        content: vm.stitchLineData
                    })
                    .then(function (response) {
                        console.log(response);
                        
                        // If posting stitch line works, store brush selections
                        vm.savedSelections = _.cloneDeep(vm.brushObj.brushSelections);
                        vm.savedBrushes = _.cloneDeep(_.reverse(vm.brushObj.brushes));
                    
                        // console.log("Saved brushes:", savedBrushes);
                        // console.log("-----------------------------")
    
                        // console.log("Here are your saved brush selections:")
                        // for(let key in savedSelections) {
                        //     console.log("Key: " + key);
                        //     console.log(savedSelections[key]);
                        //     console.log("---------------------------");
                        // }
    
                        // Then reset plot for next iteration of stitching
                        eventBus.$emit("reset-stitch");
    
                        // Then fetch data to include the saved stitch file
                        eventBus.$emit("fetch-data");
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
    
                    return;
                } else {
                    $("#cancel-save-btn").off();
                    $("#save-btn").off();
                    $('#file-name-input').val('');
    
                    // console.log("Not saving the file.");
                    return;
                }
            });
        }
    }
}

export const saveConfirm = {
    methods: {
        saveConfirm(callback){
            let vm = this;

            $("#saveModal").modal('show')
            
            $("#save-btn").on("click", function(){
    
                let filename = $('#file-name-input').val();
    
                if( !vm.isValidFilename(filename) ) {
                    $("#save-error-msg").show();
                } else {
                    callback(true);
                    $("#saveModal").modal('hide');
                    $("#save-error-msg").hide();
                }
    
            });
    
            $("#cancel-save-btn").on("click", function(){
                callback(false);
                $("#saveModal").modal('hide');
                $("#save-error-msg").hide();
            });
        }
    }
}

export const isValidFilename = {
    methods: {
        isValidFilename(fname) {
            var rg1=/^[^\\/:\*\?"<>\|  .]+$/; // forbidden characters \ / : * ? " < > |
            var rg2=/^[0-9]/; // cannot start with a number ([0-9])
            var rg3=/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names

            return rg1.test(fname)&&!rg2.test(fname)&&!rg3.test(fname);
        }
    }
}