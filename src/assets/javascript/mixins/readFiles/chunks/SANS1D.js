export default function (chunk) {
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