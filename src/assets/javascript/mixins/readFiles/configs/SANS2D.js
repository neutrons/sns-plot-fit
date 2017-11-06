import beforeFirstChunk from '../chunks/SANS2D.js';

export default {
    header : true,
    dynamicTyping : true, // parse string to int
    delimiter : "  ",
    newline : "", // auto-detect
    quoteChar : '"',
    skipEmptyLines : true,
    beforeFirstChunk
}