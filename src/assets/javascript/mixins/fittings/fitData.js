/* Code to Transform Data Points Based on the Curve Fitting Chosen */
import math from 'mathjs';
import LM from 'ml-levenberg-marquardt';
import * as _ from 'lodash';
import { eventBus } from '../../eventBus.js';

var fd = {};

fd.isSymbols = function (expression) {
    // Function to check that user did not enter a transformation that doesn't include 'x' or 'y'
    // E.g. x*2+c would throw an error
    var result = 0;

    // console.log("Expression", expression);
    // Mathjs to parse each transformation into a node
    var nodeParsed = math.parse(expression);
    //console.log("Parsed Nodes", node_parsed);

    nodeParsed.forEach(function (el) {
        var t = el.filter(function (n) {
            return n.isSymbolNode;
        });

        t.forEach(el => result += (el.name !== 'y' && el.name !== 'x'));
    });

    // console.log("result", result);
    return result > 0;
}

fd.transformData = function (data, transformations, fields = {x: 'x', y: 'y'}) {
    transformations = _.cloneDeep(transformations);
    // Need to make a temp value of data, so as to not alter the original values
    // This is passing a value rather than a reference (using lodash to handle the cloning)
    // References: 
    // https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
    // https://stackoverflow.com/questions/7574054/javascript-how-to-pass-object-by-value 
    let t = _.cloneDeep(data);

    // First swap x,y for field names
    let keys = Object.keys(transformations);

    for (let key in fields) {
        if (transformations[key] !== undefined) {
        
            let re = new RegExp(key, 'g');
        
            transformations[fields[key]] = transformations[key].replace(re, fields[key]);
            
            // if field key is not a transformation key, delete transform key
            if (keys.indexOf(fields[key]) < 0) {
                // console.log(`delete ${key} from transformations.`)
                delete transformations[key];
            }
      }
    }

    // Then get transformations
    let exp = [];
    for (let key in transformations) {
        exp.push(transformations[key]);
    };

    keys = Object.keys(transformations);
    
    t.forEach((el) => {
        // Re-assign the transformed data to x and y
        // math.eval returns an array of transformed [x,y] values
        // so d.x = math.eval()[0], d.y = math.eval()[1]
        //[el.x, el.y, el.e] = math.eval(exp, el);

        let [k0,k1,k2] = [...keys];
        [el[k0], el[k1], el[k2]] = math.eval(exp, el);
    });

    return t; // returns transformed data array   
}

fd.fitData = function (data, equation, fitsettings) {
    // Code to fit data on the transformed data
    let temp = _.cloneDeep(data);
    let tempData = {
        x: [],
        y: []
    };

    temp.forEach(function (d) {
        tempData.x.push(d.x);
        tempData.y.push(d.y);
    });

    // console.log("temp data:", tempData);

    // First, grab initial values and check for constants and swap them out in equation
    fitsettings = _.cloneDeep(fitsettings);
    // console.log('fit data', fitsettings);

    let initValues = _.cloneDeep(fitsettings.initialValues);
    // console.log("INIT VALUES:", initValues);

    initValues.forEach(iv => {
        if (iv[2]) {
            equation = equation.replace(iv[0], iv[1]);
        }
    })
    
    // console.log('Equation = ', equation);
    
    // Second, parse and compile equation
    // Parse the string. We might need some validation here
    var n_parsed = math.parse(equation);
    // console.log('n_parsed = ', n_parsed);

    // need to compile before evaluating
    var n_compiled = n_parsed.compile();
    
    // Getting all variables to fit and remove x!
    var nodes_to_fit = n_parsed.filter(function (node) {
        return node.isSymbolNode && node.name !== 'x';
    });

    var parameter_names_to_fit = nodes_to_fit.map(function (node) {
        return node.name;
    });

    // reduce duplicate coefficients to one unique value
    parameter_names_to_fit = _.uniq(parameter_names_to_fit);

    // If parameter names is an empty array, then all values are constant
    // Just evaluate with mathjs and return values
    if (parameter_names_to_fit.length === 0) {
        let constant_fitted = tempData.x.map((el) => {
            return n_compiled.eval({x: el})
        });
            
        // console.log('test fitted = ', constant_fitted);

        // Since all constants return and don't proceed with rest of function
        return {
            fittedData: fd.fittedPoints(constant_fitted, tempData.x),
            error: null,
            paramVals: _.cloneDeep(initValues),
        }; // Return fit data array
    }

    // If not all constants, set up parameters for levenberg-marquardt fitting
    let tempSettings = {};

    tempSettings = {
        damping: fitsettings.settings.damping.value,
        gradientDifference: fitsettings.settings.gradientDifference.value,
        maxIterations: fitsettings.settings.maxIterations.value,
        errorTolerance: fitsettings.settings.errorTolerance.value,
        initialValues: fitsettings.initialValues,
    }

    // console.log("TEMP SETTINGS:", tempSettings);

    var fit_function = function ([...args]) {
        var scope = {};
        // console.log('ARGS', args);

        for (let i = 0; i < args.length; i++) {
            scope[parameter_names_to_fit[i]] = args[i];
        }

        // console.log("Scope = ", scope);
        return function (x) {
            scope.x = x;
            return n_compiled.eval(scope);
        }
    };

    /* Get Initial Values only */
    let tempIV = [];

    for (let i = 0, L = tempSettings.initialValues.length; i < L; i++) {
        if (!tempSettings.initialValues[i][2]) {
            tempIV.push(tempSettings.initialValues[i][1]);
        }
    };

    // LM options. We might need to adapt some of these values
    tempSettings.initialValues = tempIV;
    const options = _.cloneDeep(tempSettings);

    // Fitting
    // console.log('Options', options);
    var fitted_params = LM(tempData, fit_function, options);

    // console.log('Fitted params:', fitted_params);
    // Get's the fitted function from the fitted parameters
    // only coefficients are set! Remember it returns a function!)
    // console.log("fitted_params.parameterValues = ", fitted_params.parameterValues);
    var fit_function_fitted = fit_function(fitted_params.parameterValues);

    var y_fitted = tempData.x.map(function (el) {
        return fit_function_fitted(el);
    });

    // console.log('y_fitted =', y_fitted);
    
    for (let i = 0, count = 0, L = initValues.length; i < L; i++) {
        if (!initValues[i][2]) {
            initValues[i][1] = fitted_params.parameterValues[count];
            count++;
        }

        initValues[i][1] = +initValues[i][1].toFixed(4);
    }

    // console.log('Final IV', initValues);
    eventBus.$emit('revise-initial-values', _.cloneDeep(initValues));

    return {
        fittedData: fd.fittedPoints(y_fitted, tempData.x),
        error: fitted_params.parameterError,
        paramVals: _.cloneDeep(initValues),
    }; // Return fit data array
}

fd.fittedPoints = function(fittedY, tempX) {
    // Return the fitted values
    let fittedPoints = [];
    
    for (let i = 0; i < fittedY.length; i++) {
        fittedPoints.push({
            x: tempX[i],
            y: fittedY[i]
        });
    }

    return fittedPoints;
}

export default fd;