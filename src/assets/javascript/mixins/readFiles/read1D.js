import axios from 'axios';
import pp from 'papaparse';

/* Functions to Read and Parse 1D Data Files */
export const read1DData = {
    methods: {
        read1DData(fileURLs, tempData, dataType) {
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

                            let data = vm.parse1D(response.data, url.filename);
                    
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
                                let data = vm.parse1D(content, url.filename);

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

/* Function to Parse 1D Data Files */
export const parse1D =  {
    methods: {
        parse1D(data, filename) {
            function beforeFirstChunk1D(chunk) {
                // Split the text into rows
                var rows = chunk.split(/\r\n|\r|\n/);
                var delimiterRegex = /([\s,]+)/g;

                // Find the delimiter on 3rd row
                var match = delimiterRegex.exec(rows[2]);
                var delimiter = match[1];
                var header = rows[0];

                if (header.startsWith("#")) {
                    header = header.replace(/#\s*/, '');
                    header = header.split(/[\s,]+/).join(delimiter);
                }

                rows[0] = header.toLowerCase();

                // Remove the 2nd row if it's not data
                if (rows[1].length <= 2) {
                    rows.splice(1, 1);
                }

                return rows.join("\r\n");
            }

            // files ending in Iq.txt
            var config1D = {
                header : true,
                dynamicTyping : true, // parse string to int
                delimiter : "",       // auto-detect
                newline : "",         // auto-detect
                quoteChar : '"',
                skipEmptyLines : true,
                beforeFirstChunk : beforeFirstChunk1D
            }

            var results1D = pp.parse(data, config1D ).data;

            // Filter out any negative values
            results1D = results1D.filter(row => row.y > 0 && row.x > 0);
            results1D.forEach(row => row.name = filename);
            
            return {filename: filename, data: results1D};
        }
    }
}