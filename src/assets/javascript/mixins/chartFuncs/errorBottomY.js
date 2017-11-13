import * as d3 from 'd3';

export default function(d, yType, y) {
    
    if (d.y - d.e < 0 && yType === "Log(Y)") {
        return y(d.y)
    } else {
        return y(d.y - d.e);
    }
}