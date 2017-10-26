import * as d3 from 'd3';

export const formatData = {
    methods: {
        formatData(data) {
            let vm = this;

            let formatted = [];

            for (let i = 0, len = data.length; i < len; i++) {
                let tempData = data[i].values;
                let tempName = data[i].key;

                let x = [], y = [], e = [];

                tempData.forEach(el => { 
                    x.push(el.x);
                    y.push(el.y);
                    e.push(el.e);
                })

                formatted.push( [ tempName, {x:x, y:y, e:e}]);
            }

            // Sort curves form least to greatest
            formatted.sort(function(a,b) {
                let minA = _.min(a[1].x);
                let minB = _.min(b[1].x);

                return minA - minB;
            })

            return formatted;
        }
    }
}