export default function(chunk) {
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

    // Remove punctuations from header names for readability
    header = header.replace(/Pt./, 'pt');

    rows[0] = header.toLowerCase();

    rows = rows.map(function(el) {
        let newString = el.replace(/\s+/g,' ').trim();

        return newString;
    })

    return rows.join("\r\n");
}