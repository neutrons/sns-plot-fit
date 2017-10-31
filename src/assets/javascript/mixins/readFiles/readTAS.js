import axios from 'axios';
import pp from 'papaparse';

/* Functions to Read and Parse 2D Files */
export const getTASData = {
    methods: {
        getTASData(file) {
            var vm = this;
            
            // If data is not stored, fetch it, store it, and send data to be plotted
            axios.get(file.url).then(response => {

                // First - extract metadata from data table
                let extractedData = vm.extractMetadata(response.data);

                // Second - parse data
                extractedData.data = vm.parseTAS(extractedData.data);
                extractedData.filename = file.filename;
                // console.log("EXTRACTED:", extractedData);

                // Third - store and set current data
                vm.$store.commit('storeData', {dataType: 'TAS', data: extractedData, filename: file.filename});
                vm.currentData = extractedData;

            }).catch(reason => { console.log(reason) });;
            
        }
    }
}

export const extractMetadata = {
    methods: {
        extractMetadata(data) {

            let m1 = data.match('# col_headers = ');
            let m2 = data.match('# Sum of Counts');

            let dataTable = data.slice(m1.index + 18, m2.index);
            let metadata = data.slice(0, m1.index).concat(data.slice(m2.index))

            // Remove pounds
            metadata = metadata.replace(/#\s/g, '');
            metadata = metadata.split(/\r\n|\r|\n/);
            metadata = metadata.filter(function(d) { return d !== ''; });

            // console.log(metadata);
            // console.log(dataTable);
            return { metadata: metadata, data: dataTable };
        }
    }
}

export const readTASData = {
    methods: {
        readTASData(file) {
            var vm = this;

            var reader = new FileReader();

            reader.onload = function (e) {  
                // Get file content
                var content = e.target.result;

                // First - extract metadata from data table
                let extractedData = vm.extractMetadata(content);
                
                // Second - parse data
                extractedData.data = vm.parseTAS(extractedData.data);
                extractedData.filename = file.filename;
                // console.log("EXTRACTED:", extractedData);

                // Third - store and set current data
                vm.$store.commit('storeData', {dataType: 'TAS', data: extractedData, filename: file.filename});
                vm.currentData = extractedData;
       
            }
            
            reader.readAsText(file.blob, "UTF-8");
        }
    }
}


/* Function to Parse 2D Data Files */
export const parseTAS = {
    methods: {
        parseTAS(data) {
        
            function beforeFirstChunkTAS(chunk) {
                // Split the text into rows
                var rows = chunk.split(/\r\n|\r|\n/);

                var delimiterRegex = /([\s,]+)/g;

                // Find the delimiter on 2nd row
                var match = delimiterRegex.exec(rows[1]);
                var delimiter = match[1];
                var header = rows[0];

                if (header.startsWith("#")) {
                    header = header.replace(/#\s*/, '');
                    header = header.split(/[\s,]+/).join(delimiter);
                }

                rows[0] = header.toLowerCase();

                rows = rows.map(function(el) {
                    let newString = el.replace(/\s+/g,' ').trim();

                    return newString;
                })

                return rows.join("\r\n");
            }

            var configTAS = {
                header : true,
                dynamicTyping : true, // parse string to int
                delimiter : " ",
                newline : "", // auto-detect
                quoteChar : '"',
                skipEmptyLines : true,
                beforeFirstChunk : beforeFirstChunkTAS
            }

            var resultsTAS = pp.parse(data, configTAS).data;

            return resultsTAS;
        }
    }
}