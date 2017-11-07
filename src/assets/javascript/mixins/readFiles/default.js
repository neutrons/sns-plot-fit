import axios from 'axios';
// import parseData from './parse/SANS1D.js';

/* Functions to Read and Parse 1D Data Files */
export const read1DData = {
    methods: {
        read1DData(fileURLs, tempData, dataType, parseFunc) {
            // Next fetch unstored files
                /*****************************************
                 When a user selects data to be plotted,
                it first must be fetched, either from
                an HTTP request or FileReader. In order
                to handle reading multiple files
                asynchronously, JavaScript promises are used.
                That way we can "wait" for all data
                to be loaded asynchronously before moving on
                to plotting the data.
                *****************************************/
                var vm = this;

                var promises = fileURLs.map(function(url) {

                    if (url.type === 'fetch') {
                        return axios.get(url.url).then(function(response) {
                            // console.log("axios response data", response);

                            let data = parseFunc(response.data, url.filename);
                    
                            vm.$store.commit('storeData', { filename: url.filename, data: data, dataType: dataType});

                            return data;
                        });        
                    } else if (url.type === 'upload') {

                        // Turn file reader into a promise in order to
                        // wait on the async reading of files with Promise.all below
                        return new Promise((resolve, reject) => {
                            var reader = new FileReader();
                            
                            reader.onload = function (e) {  
                                // Get file content
                                var content = e.target.result;

                                // Code to read Upload 2D file
                                let data = parseFunc(content, url.filename);

                                vm.$store.commit('storeData', { filename: url.filename, data: data, dataType: dataType});
                                
                                resolve(data);    
                            }
                            
                            reader.readAsText(url.url, "UTF-8");
                        });
                    } else {
                        console.log("Sorry, uknown type.");
                    }
                });

                if (promises.length > 0) {
 
                    Promise.all(promises).then(results => {
                        let plotData = _.concat(tempData, results);
                        
                        vm.setCurrentData(plotData, vm.filesToPlot);

                    }).catch(reason => { console.log(reason) });
                }
        }
    }
}