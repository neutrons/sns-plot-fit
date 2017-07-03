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

import math from 'mathjs';

var fd = {};

fd.transformData = function(data, fit, equation) {

    console.log("Transforming data...");
    if ('Guinier') {

        //code to transform data
        parameters.data = [];

        //code to fit line to selected data
        parameters.fittedLine = [];


    } else if ('Porod') {

    } else if ('Kratky') {

    } else if ('Debye Beuche') {

    } else {
        //If none just return data un-transformed
    }

    return (someTransformedData); //return transformed data
}

fd.fitLine = function(fit, data, equation) {

    return (someFitData); //returned fitted data
}

export default fd;