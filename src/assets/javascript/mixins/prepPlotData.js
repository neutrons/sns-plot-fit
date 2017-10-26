import * as d3 from 'd3';
import _ from 'lodash';

export const prepPlotData = {
    methods: {
        prepPlotData(sd, callback) {
            let vm = this;

            let temp = callback();

             temp = _.flatten(temp);
             temp = temp.filter((d) => Number.isFinite(d.y) && Number.isFinite(d.x));
     
             // Nest the entries by name
             temp = d3.nest()
                 .key(function (d) {
                     return d.name;
                 })
                 .entries(temp);
 
             // console.log("Merging data:", _.flatten(temp));
             return temp;
        }
    }
}