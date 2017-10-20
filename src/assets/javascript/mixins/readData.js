import axios from 'axios';
import pp from 'papaparse';


/* Functions to Read and Parse 1D Data Files */
export const read1DData = {
    methods: {
        read1DData(file) {

        }
    }
}

export const pull1DData = {
    methods: {
        pull1DData(fileURLs, tempData) {
            // Next fetch unstored files
                /*****************************************
                 When a user selects data to be plotted,
                it first must be fetched, either from
                an HTTP request or FileReader. In order
                to handle pulling multiple files
                asynchronously, JavaScript promises are used.
                That way we can "wait" for all data
                to be loaded asynchronously before moving on
                to plotting the data.
                *****************************************/
                var vm = this;

                var promises = fileURLs.map(function(url) {

                    if(url.type === 'fetch') {
                        return axios.get(url.url).then(function(response) {
                            // console.log("axios response data", response);

                            let data = vm.parse1D(response.data, url.filename);
                            
                            // console.log("cleaned up axios data", data);
                            vm.$store.commit('store1DData', { filename: url.filename, data: data});
                            //vm.storedData[url.filename] = response.data;
                            return data;
                        });        
                    } else if(url.type === 'upload') {

                        // Turn file reader into a promise in order to
                        // wait on the async reading of files with Promise.all below
                        return new Promise((resolve, reject) => {
                            var reader = new FileReader();
                            
                            reader.onload = function (e) {  
                                // Get file content
                                var content = e.target.result;

                                // Code to read Upload 2D file
                                let data = vm.parse1D(content, url.filename);
                                vm.$store.commit('store1DData', { filename: url.filename, data: data});
                                // vm.storedData[url.filename] = content;
                                
                                resolve(data);    
                            }
                            
                            reader.readAsText(url.url, "UTF-8");
                        });
                    } else {
                        //console.log("Sorry, uknown type.");
                    }
                });

                if(promises.length === 0) {
                    // eventBus.$emit('disable-buttons', true);
                    // eventBus.$emit('set-current-data', tempData, this.filesToPlot);
                    // console.log("No data to plot!");
                } else {
                    Promise.all(promises).then(results => {
                        let plotData = _.concat(tempData, results);
                        // console.log("Data is ready to be plotted!", plotData);
                        // var data = results.cocnat(tempData);
                        // console.log("Results", results);
                        // console.log("tempData", tempData);
                        // var fetchData = results.map(function(result) {
                        //     return vm.parse1D(result.data, result.filename);
                        // });

                        vm.setCurrentData(plotData, this.filesToPlot);
                        // var data = fetchData.concat(tempData);
                        
                        // eventBus.$emit('disable-buttons', true);
                        // eventBus.$emit('set-current-data', data, this.filesToPlot);
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
            var config1D =
                {
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

/* Functions to Read and Parse 2D Files */
export const get2DData = {
    methods: {
        get2DData(file) {
            var vm = this;
            
            // If data is not stored, fetch it, store it, and send data to be plotted
            axios.get(file.url).then(response => {

                let results = vm.parse2D(response.data);
                vm.$store.commit('store2DData', { filename: file.filename, data: results.data });
                vm.currentData = results.data;

                // Call plotting function
                vm.drawPlot(results.data, vm.hexSettings);
            });
            
        }
    }
}

export const read2DData = {
    methods: {
        read2DData(file) {
            var vm = this;

            var reader = new FileReader();

            reader.onload = function (e) {  
                // Get file content
                var content = e.target.result;
                // Code to read Upload 2D file
                let results = vm.parse2D(content);
                // console.log("results", results);
                results.data.forEach(el => el.name = file.filename);
                
                // Push to 2D Get Files list
                vm.$store.commit('store2DData', {filename: file.filename, data: results.data });
                vm.currentData = results.data;

                // Call plotting function
                vm.drawPlot(results.data, vm.hexSettings);        
            }
            reader.readAsText(file.blob, "UTF-8");
        }
    }
}


/* Function to Parse 2D Data Files */
export const parse2D = {
    methods: {
        parse2D(data) {
        function beforeFirstChunk2D(chunk) {
            // Split the text into rows
            var rows = chunk.split(/\r\n|\r|\n/);
            var header = rows[0];
            header = header.replace(/,/, '');
            if (header.startsWith("Data columns")) {
                header = header.replace(/Data columns\s*/, '');
                header = header.split(/[\s,-]+/).join("  ");
            }

            // Rename headings for readability
            header = header.replace(/I\(QxQy\)/, 'intensity');
            header = header.replace(/err\(I\)/, 'error');

            rows[0] = header.toLowerCase();
            // Remove the 2nd row if it's not data
            if (rows[1].split(/[\s,-]+/).length <= 2) {
                rows.splice(1, 1);
            }
            return rows.join("\r\n");
            }

            var config2D = {
            header : true,
            dynamicTyping : true, // parse string to int
            delimiter : "  ",
            newline : "", // auto-detect
            quoteChar : '"',
            skipEmptyLines : true,
            beforeFirstChunk : beforeFirstChunk2D
            }

            var results2D = pp.parse(data, config2D );

            return results2D;
        }
    }
}