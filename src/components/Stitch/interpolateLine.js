var everpolate = require('everpolate');
var LM = require('ml-levenberg-marquardt');
var _ = require('lodash');

var interpolate = (function(everpolate, LM, _) {

    var my = {};
    
    my.linear = function (selected) {

        /* Global private value for scaling base curves with each for loop iteration */
            var stitchedLine = undefined;
            var linear = everpolate.linear;
            
            // Set first base and non-base, the rest are assigned with newly fitted curve
            var base = undefined;
            var baseName = undefined;

            var nonBaseName = undefined;
            var nonBase = undefined;

            var seg1, seg2, seg3; // Variable to slice of left and right of curves and marge with stitched curve

            // Fitting/minimization function
            function shift([k]) {
                return (y) => (y + k);
            }
        
        /* End of Global private values */
            
        for(let i = 0, len = selected.length; i < len; i++) {


            base = selected[i][0][2];
            baseName = selected[i][0][0];

            nonBaseName = selected[i][1][0];
            nonBase = selected[i][1][2];

            var yNonBaseInterpolated = linear(base.x, nonBase.x, nonBase.y);

            // console.log("** Original Non base x,y values:")
            // console.log("x = ", nonBase.x);
            // console.log("y = ", nonBase.y);

            // console.log("** Interpolates Non base y values using base x values:")
            // console.log("x = ", base.x);
            // console.log("y = ", yNonBaseInterpolated)


            // Now let's minimize the difference between: YBase and yNonBaseInterpolated
            const options = {
                damping: 0.001,
                initialValues: [1],
                gradientDifference: 0.1,
                maxIterations: 100,
                errorTolerance: 0.001
            };

            // Data to fit in the func above
            let data = {
                x: yNonBaseInterpolated,
                y: base.y
            };

            var fitted_params = LM(data, shift, options);
            var k = fitted_params.parameterValues[0];

            // console.log("** Scaling value: K =", k)

            var yNonBaseScaled = nonBase.y.map(function(el) {
                return (el + k);
            });

            // console.log('yNonBaseScaled =', yNonBaseScaled);
            
            // Final curve:
            // Concatenate and sort the arrays
            let xFinal = base.x.concat(nonBase.x);
            let yFinal = base.y.concat(yNonBaseScaled);
            let eFinal = base.e.concat(nonBase.e);

            // 1) combine the arrays:
            var list = [];
            for (let i = 0, len = xFinal.length; i < len; i++) 
                list.push({'x': xFinal[i], 'y': yFinal[i], 'e': eFinal[i]});

            // 2) sort:
            list.sort(function(a, b) {
                return a.x - b.x;
            });

            // 3) separate them back out:
            for (let i = 0, len = list.length; i < len; i++) {
                xFinal[i] = list[i].x;
                yFinal[i] = list[i].y;
                eFinal[i] = list[i].e;
            }

            let interpCurve = {x: xFinal, y: yFinal, e: eFinal};

            // First shift all curves for proceeding brushes
            selected = shiftCurves(selected, i, k);

            if (i === 0) {
                seg1 = sliceCurve(selected[i][0][1], "left", selected[i][2][0]);
                seg2 = interpCurve;
                seg3 = sliceCurve(selected[i][1][1], "right", selected[i][2][1]);
            } else {
                seg1 = sliceCurve(stitchedLine, "left", selected[i][2][0]);
                seg2 = interpCurve;
                seg3 = sliceCurve(selected[i][1][1], "right", selected[i][2][1]);
            }

            stitchedLine = mergeSegs(seg1, seg2, seg3);
        }

        /*  Final step: Check if the line is negative for Y
            If so, find the minimum negative value of y and shifted all up by that value
            If no negative values, proceed as normal 
        */
        stitchedLine = fixNegatives(stitchedLine);
        //console.log("Stitched Line:", stitchedLine);

        return stitchedLine;     
        
    }

    function fixNegatives(line) {

        let minY = _.min(line.y);

        if(minY < 0) {
            line.y = line.y.map(function(el) {
                let result = el + (-1 * minY);
                
                if(result === 0) {
                    return Number.MIN_VALUE; // this is to prevent errors when log of zero
                } else {
                    return result;
                }
            });
        }

        return line;
    }

    /* Shift Curves Function:
        The function takes the entire array of selected data and shifts the curve's data by y+k.
        (the same is applied to the selected data).

        k is the constant to shift a curve's y value

        n is the current iteration of the linear interpolation function above.
            This is to prevent applying a k-shift to post-merged curve data.
    */
    function shiftCurves(curves, n, k) {

        for(let i = n, length = curves.length; i < length; i++) {
        
            let tempPair = curves[i];
            
            for(let j = 0, length = tempPair.length - 1; j < length; j++) {
                
                if(!(i === n && j === 0)) {
                    // Shift all data
                    curves[i][j][1].y = curves[i][j][1].y.map(function(el) {
                        return el + k
                    });
                    
                    // Shift selected data
                    curves[i][j][2].y = curves[i][j][2].y.map(function(el) {
                        return el + k
                    });
                }
                
            }            
        }

        return curves;
    }


    /* Slice Curve Function:
        The function takes a set of data and selects data depending on the direction and cutoff value.

        Direction is either 'left' or 'right', which is associated with a brush.
        Cutoff is the value to place the condition on. Anything left/right of cutoff will not be included.

        The final slice is returned for the ultimate merging of curves.
    */
    function sliceCurve(data, direction, cutoff) {
        
        let temp = {x:[], y:[], e:[]};

        for( let i = 0, len = data.x.length; i < len; i++) {

            if ( direction === 'right' && data.x[i] > cutoff) {
                temp.x.push(data.x[i]);
                temp.y.push(data.y[i]);
                temp.e.push(data.e[i]);
            }

            if ( direction === 'left' && data.x[i] < cutoff) {
                temp.x.push(data.x[i]);
                temp.y.push(data.y[i]);
                temp.e.push(data.e[i]);
            }
        }

        return temp;
    }

    /* Merge Curves Function:
        Takes three segments and marges the points in order of left to right for segment position.
        The three segments merge into a new curve. 
        This function is called at the end of the line interpolation.
    */

    function mergeSegs(s1, s2, s3) {
        let merged = {x:[], y:[], e:[]};

        merged.x.push(s1.x);
        merged.x.push(s2.x);
        merged.x.push(s3.x);
        merged.x = _.flatten(merged.x);

        merged.y.push(s1.y);
        merged.y.push(s2.y);
        merged.y.push(s3.y);
        merged.y = _.flatten(merged.y);

        merged.e.push(s1.e);
        merged.e.push(s2.e);
        merged.e.push(s3.e);
        merged.e = _.flatten(merged.e);

        return merged;
    }

    return my;
})(everpolate, LM, _);

export default interpolate;