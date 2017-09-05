import pp from 'papaparse';

export const parse1D =  {
    mounted() {
        console.log("From parse 1d");
    },
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

export const parse2D = {
    mounted() {
        console.log("From parse 2d");
    },
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