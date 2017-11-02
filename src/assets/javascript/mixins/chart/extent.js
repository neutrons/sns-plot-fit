import * as d3 from 'd3';

export default function(nd, type) {
        
            let extent = d3.extent(nd.map(el => {
                return el.values
            }).reduce(function(a,b) {
                return a.concat(b);
            }), function(d) { return d[type]; });

            // If extents are the same, +-1 in order to not plot a flat chart
            if (extent[0] === extent[1]) {
                extent[0] -= 1;
                extent[1] += 1;
            }

            return extent;
};