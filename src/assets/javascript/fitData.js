/* Code to Transform Data Points Based on the Curve Fitting Chosen */

import math from 'mathjs';
import LM from 'ml-levenberg-marquardt';
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

fd.fitData = function(data, equation) {
    // Code to fit data on the transformed data
    // console.log("Equation:", equation);
    // console.log("Min X:", minX);
    // console.log("Max X:", maxX);
    let temp = _.cloneDeep(data);
    let tempData = {
        x: [],
        y: []
    };

    temp.forEach(function(d) {
        tempData.x.push(d.x);
        tempData.y.push(d.y);
    });

    // Parse the string. We might need some validation here
    var n_parsed = math.parse(equation);

    // here I'm getting all variables to fit and remove x!
    // May be the validation goes here
    var nodes_to_fit = n_parsed.filter(function(node) {
    return node.isSymbolNode && node.name != 'X';
    });


    // If those are defined as var, node scope gets nuts
    var parameter_names_to_fit = nodes_to_fit.map(function(node) {
    return node.name;
    });

    // console.log("parameter_names_to_fit:", parameter_names_to_fit);

    // need to compile before evaluating
    var n_compiled = n_parsed.compile();

    // fitting function
    // Needs to be written like this because we have no idea
    // What are the arguments that we getting
    // Note that it returns a function that allows to vary x!
    // var fit_function = new Function(parameter_names_to_fit,
    //     'var scope = {};\
    //     for (i = 0; i < arguments.length; i++) {\
    //         scope[parameter_names_to_fit[i]] = arguments[i];\
    //     }\
    //     return function(x) {\
    //         scope.x=x;\
    //         return n_compiled.eval(scope);\
    //     }'
    // );

    var fit_function = function([...args]) {
        var scope = {};

        for(let i=0; i < args.length; i++) {
            scope[parameter_names_to_fit[i]] = args[i];
        }
        
        // console.log("Scope = ", scope);
        return function(x) {
            scope.X = x;
            return n_compiled.eval(scope);
        }
    };

    // array of initial parameter values for initial paramters to fit: all at 1
    var initialValues = parameter_names_to_fit.map(function (x, i) { return 1.0; });
    
    // LM options. We might need to adapt some of these values
    const options = {
        damping: 1.5,
        initialValues: initialValues,
        gradientDifference: 10e-2,
        maxIterations: 200,
        errorTolerance: 10e-3
    };

    // Fitting   
    var fitted_params = LM(tempData, fit_function, options);
    // console.log("---- Fitted Parameters ---")
    for (let i = 0; i < parameter_names_to_fit.length; i++) {
        // console.log(parameter_names_to_fit[i], "=", fitted_params.parameterValues[i])
    }
    // console.log("Error =", fitted_params.parameterError)
    // console.log("Iterations =", fitted_params.iterations)
    // console.log("--------------------------")
    // Get's the fitted function from the fitted parameters
    // only coefficients are set! Remember it returns a function!)
    // console.log("fitted_params.parameterValues = ", fitted_params.parameterValues);
    var fit_function_fitted = fit_function(fitted_params.parameterValues);

    var y_fitted = tempData.x.map(function(el) {
        return fit_function_fitted(el);
    });

    // console.log('y_fitted =', y_fitted);

    // Return the fitted values
    var fittedPoints = [];
    // console.log("Fitted Length = " + y_fitted.length + " | X length = " + tempData.x.length);
    for(let i = 0; i < y_fitted.length; i++) {
    fittedPoints.push({
        x: tempData.x[i],
        y: y_fitted[i]
    });
    }

    // t = configuration.fit === "None" || configuration.fit === "Linear" ? t.data : t.dataTransformed;
    return fittedPoints; // Return fit data array
}

export default fd;