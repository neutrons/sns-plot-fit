var everpolate = require('everpolate');

var interpolate = (function(everpolate) {

    var my = {};
    
    my.regression = function (data, base) {

        // var linearRegression = everpolate.linearRegression
        // , xValues = [0, 1, 2, 3, 4, 5]
        // , yValues = [2, 3, 4, 5, 6, 7]
        // , regression = linearRegression(xValues, yValues)

        // console.log("Slope", regression.slope);
        // console.log("Intercept", regression.intercept);
        // console.log("------------------------");
        // console.log("Evaluate: (2, 3.5, 4, 4.5) -> ", regression.evaluate([2, 3.5, 4, 4.5]))
        return 'here is a line';
    }

    return my;
})(everpolate);

export default interpolate;