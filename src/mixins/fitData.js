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
//         fitName: "None",
//         equation: null,
//         yTransformation: null,
//         xTransformation: null,        
//         yLabel: "I",
//         xLabel: "Q",
//         yScale: d3.scaleLinear(),
//         xScale: d3.scaleLinear(),
//         range: [-Infinity, +Infinity],
//         fittedData: []
//     },
//     {
//         fitName: "Guinier",
//         equation: "-Rg^2/3*X+b",
//         yTransformation: "log(y)",
//         xTransformation: "x^2",        
//         yLabel: "Log(I)",
//         xLabel: "Log(Q)",
//         yScale: d3.scaleLog().clamp(true),
//         xScale: d3.scalePow().exponent(2),
//         range: [-Infinity, +Infinity],
//         fittedData: []
//     },
//     {
//         fitName: "Porod",
//         equation: "A-n*X",
//         yTransformation: "log(y)",
//         xTransformation: "log(x)",        
//         yLabel: "Log(I)",
//         xLabel: "Log(Q)",
//         yScale: d3.scaleLog().clamp(true),
//         xScale: d3.scalePow().exponent(2),
//         range: [-Infinity, +Infinity],
//         fittedData: []
//     },
//     {
//         fitName: "Zimm",
//         equation: "1/I0+Cl^2/I0*X",
//         yTransformation: "log(y)",
//         xTransformation: "x^2",        
//         yLabel: "1/I",
//         xLabel: "Q^2",
//         yScale: d3.scalePow().exponent(-1),
//         xScale: d3.scalePow().exponent(2),
//         range: [-Infinity, +Infinity],
//         fittedData: []
//     },
//     {
//         fitName: "Kratky",
//         equation: "m*X+b",
//         yTransformation: "log(y)",
//         xTransformation: "x^2",        
//         yLabel: "log(Q^2*I)",
//         xLabel: "Log(Q)",
//         yScale: d3.scaleLog().clamp(true),
//         xScale: d3.scalePow().exponent(2),
//         range: [-Infinity, +Infinity],
//         fittedData: []
//     },
//     {
//         fitName: "Debye Beuche",
//         equation: "m*X+I0",
//         yTransformation: "log(y)",
//         xTransformation: "x^2",        
//         yLabel: "sqrt(I)",
//         xLabel: "Q^2",
//         yScale: d3.scaleSqrt(),
//         xScale: d3.scalePow().exponent(2),
//         range: [-Infinity, +Infinity],
//         fittedData: []
//     }

// ];


// configurations.forEach(function(conf) {
//     console.log(conf);
//     if(conf.fitName === this.fitName) {
//     // Plot the button with name
    
//     // populate field with equation
//     // Axis Transformation of coordinates:
//     var xFunction = math.parse(conf.xTransformation).compile();
//     conf.newXValues = function (x) { x.map(function (i) { xFunction.eval({x:i}) })};

//     // plot axes scaling
//     }

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