/* Function to Parse 1D Data Files */
import pp from 'papaparse';
import config from '../configs/TAS.js';

function extractMetadata(data) {
    
        let m1 = data.match('# col_headers = ');
        let m2 = data.match('# Sum of Counts');
    
        let dataTable = data.slice(m1.index + 18, m2.index);
        let metadata = data.slice(0, m1.index).concat(data.slice(m2.index))
    
        // Remove pounds '#'
        metadata = metadata.replace(/#\s/g, '');
        metadata = metadata.split(/\r\n|\r|\n/);
        metadata = metadata.filter(function(d) { return d !== ''; });
    
        return { metadata: metadata, data: dataTable };
    }
    
    
/* Function to Parse TAS Data Files */
export default function (data, filename) {

    // First - extract metadata from data table
    let extractedData = extractMetadata(data);
    
    // Second - parse data
    extractedData.data = pp.parse(extractedData.data, config).data;
    extractedData.data.forEach(row => row.name = filename);

    extractedData.filename = filename;

    
    return extractedData;
}