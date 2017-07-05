/* Code to Transform Data Points Based on the Line Fit Chosen *******
  
    DEFAULTS:
    ------------------------------------
    Guinier:
        Equation: b - (Rg^2)/3
        yAxis: LOG(Y)
        xAxis: X^2
        yAxisTitle: LOG( I(Q) )
        xAxisTitle: X^2
        Range: [-Infinity, +Infinity]
        fitData: []
    ------------------------------------
    Porod:
        Equation: 
        yAxis:
        xAxis:
        yAxisTitle:
        xAxisTitle:
        Range:
        fitData: []
    ------------------------------------
    Zimm:
        Equation: 
        yAxis:
        xAxis:
        yAxisTitle:
        xAxisTitle:
        Range:
        fitData: []
    ------------------------------------
    Kratky:
        Equation: 
        yAxis:
        xAxis:
        yAxisTitle:
        xAxisTitle:
        Range:
        fitData: []
    ------------------------------------
    Debye Beuche
        Equation: 
        yAxis:
        xAxis:
        yAxisTitle:
        xAxisTitle:
        Range:
        fitData: []
    ------------------------------------
    Parameter Variables:
     {
        data: [],
        xScale: "X",
        yScale: "Y",
        xAxisTitle: 'X',
        yAxisTitle: 'I(Q)',
        Fit: 'None',
        fitData: []
      }
*********************** End Info ************************************/

// configurations = [
//     {
//         name: "Guinier",
//         equation: "-Rg^2/3*X+b",
//         y_transformation: "log(y)",
//         x_transformation: "x^2",        
//         y_label: "Log(Q)",
//         x_label: "Q^2",
//         y_scale: d3.scaleLog(),
//         x_scale: d3.scalePow().exponent(2),
//         range: [-Infinity, +Infinity],
//         fit_dataset: []
//     },
//     {
//         name: "Porod",
//         equation: "A-n*X",
//         y_transformation: "log(y)",
//         x_transformation: "log(x)",        
//         y_label: "Log(I)",
//         x_label: "Log(Q)",
//         y_scale: d3.scaleLog(),
//         x_scale: d3.scalePow().exponent(2),
//         range: [-Infinity, +Infinity],
//         fit_dataset: []
//     },
//     {
//         name: "Zimm",
//         equation: "1/I0+Cl^2/I0*X",
//         y_transformation: "log(y)",
//         x_transformation: "x^2",        
//         y_label: "1/I",
//         x_label: "Q^2",
//         y_scale: d3.scaleLog(),
//         x_scale: d3.scalePow().exponent(2),
//         range: [-Infinity, +Infinity],
//         fit_dataset: []
//     },
//     {
//         name: "Kratky",
//         equation: "m*X+b",
//         y_transformation: "log(y)",
//         x_transformation: "x^2",        
//         y_label: "log(Q^2*I)",
//         x_label: "Log(Q)",
//         y_scale: d3.scaleLog(),
//         x_scale: d3.scalePow().exponent(2),
//         range: [-Infinity, +Infinity],
//         fit_dataset: []
//     },
//     {
//         name: "Debye Beuche",
//         equation: "m*X+I0",
//         y_transformation: "log(y)",
//         x_transformation: "x^2",        
//         y_label: "sqrt(I)",
//         x_label: "Q^2",
//         y_scale: d3.scaleLog(),
//         x_scale: d3.scalePow().exponent(2),
//         range: [-Infinity, +Infinity],
//         fit_dataset: []
//     }

// ];


// configurations.forEach(function(conf) {
//     console.log(conf);
//     // Plot the button with name
    
//     // populate field with equation
//     // Axis Transformation of coordinates:
//     var xFunction = math.parse(conf.xTransformation).compile()
//     conf.new_x_axis = function (x) { x.map(function (i) { x_function.eval({x:i}) })};

//     // plot axes scaling

// });


import math from 'mathjs';

var fd = {};

fd.transformData = function(data, equation) {

    //code to transform data
    console.log("Transforming data...");
    return (data); //return transformed data
}

fd.fitLine = function(data, equation) {

    return (someFitData); //returned fitted data
}

export default fd;