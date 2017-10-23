import * as d3 from 'd3';

export default function(d, yType, scale) {
    
    if (d.y - d.e < 0 && yType === "Log(Y)") {
        return scale(d.y)
    } else {
        return scale(d.y - d.e);
    }
}