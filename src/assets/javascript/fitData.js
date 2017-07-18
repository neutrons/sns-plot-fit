/* Code to Transform Data Points Based on the Curve Fitting Chosen */

import math from 'mathjs';
import * as _ from 'lodash';
var fd = {};

fd.transformData = function(data, configuration) {

        // Need to make a temp value of data, so as to not alter the original values
        // This is passing a value rather than a reference (using lodash to handle the cloning)
        // Good References: 
        // https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
        // https://stackoverflow.com/questions/7574054/javascript-how-to-pass-object-by-value 
        let t = _.cloneDeep(data);
        var exp = [configuration.xTransformation, configuration.yTransformation, configuration.eTransformation];
        
        t.data.forEach( (el) => {      
                // Re-assign the transformed data to x and y
                // math.eval spits out an array of transformed [x,y] values
                // so d.x = math.eval()[0], d.y = math.eval()[1]
                [el.x, el.y, el.e] = math.eval(exp, el);
            });
        
        return t.data; // returns transformed data array
}

fd.fitData = function(data, equation, minX, maxX) {
    // Code to fit data on the transformed data
    // console.log("Equation:", equation);
    // console.log("Min X:", minX);
    // console.log("Max X:", maxX);

    let t = _.cloneDeep(data);
    // t = configuration.fit === "None" || configuration.fit === "Linear" ? t.data : t.dataTransformed;
    return t; // Return fit data array
}

fd.fitLine = function(data, equation) {

    return (someFitData); // Returned fitted data
}

export default fd;