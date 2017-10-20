import * as d3 from 'd3';

export default function(nd, type) {
        
            return d3.extent(nd.map(el => {
                return el.values
            }).reduce(function(a,b) {
                return a.concat(b);
            }), function(d) { return d[type]; });
          
};