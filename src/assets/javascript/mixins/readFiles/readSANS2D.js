import axios from 'axios';
import { eventBus } from '../../eventBus';

/* Functions to Read and Parse 2D Files */
export const readSANS2D = {
    methods: {
        get2DData(file) {
            let vm = this;

            // If data is not stored, fetch it, store it, and send data to be plotted
            axios.get(file.url).then(response => {
                let results = vm.parseData(response.data);

                vm.$store.commit('storeData', { filename: file.filename, data: results.data, dataType: 'SANS2D' });

                vm.currentData = results.data;

                // Call plotting function
                vm.drawChart(results.data, vm.hexSettings);
            }).catch(reason => { 
                let errorMsg = `Error! ${reason}`;
                eventBus.$emit('error-message', errorMsg, 'danger');
                console.log(reason) 
            });
            
        },
        read2DData(file) {
            let vm = this;
            let reader = new FileReader();

            reader.onload = function (e) {  
                // Get file content
                let content = e.target.result;

                // Code to read Upload 2D file
                let results = vm.parseData(content);
                
                // console.log("results", results);
                results.data.forEach(el => el.name = file.filename);
                
                // Push to 2D Get Files list
                vm.$store.commit('storeData', { filename: file.filename, data: results.data, dataType: 'SANS2D' });

                vm.currentData = results.data;

                // Call plotting function
                vm.drawChart(results.data, vm.hexSettings);        
            }
            reader.readAsText(file.blob, "UTF-8");
        },
    },
};