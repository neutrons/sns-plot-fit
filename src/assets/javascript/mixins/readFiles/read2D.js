import axios from 'axios';
import pp from 'papaparse';

/* Functions to Read and Parse 2D Files */
export const get2DData = {
    methods: {
        get2DData(file) {
            var vm = this;
            
            // If data is not stored, fetch it, store it, and send data to be plotted
            axios.get(file.url).then(response => {

                let results = vm.parse2D(response.data);

                vm.$store.commit('storeData', { filename: file.filename, data: results.data, dataType: 'SANS2D' });

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
                vm.$store.commit('storeData', { filename: file.filename, data: results.data, dataType: 'SANS2D' });

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