/* Function to Parse 1D Data Files */
import pp from 'papaparse';
import config from '../configs/SANS1D.js';

export const parseData = {
    methods: {
        parseData(data, filename) {
    
            var results1D = pp.parse(data, config).data;

            // Filter out any negative values
            results1D = results1D.filter(row => row.y > 0 && row.x > 0);
            results1D.forEach(row => row.name = filename);
            
            return {filename: filename, data: results1D};
        },
    },
}