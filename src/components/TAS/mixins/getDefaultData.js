import * as d3 from 'd3';

export default function getDefaultData() {
    return {
        msg: 'TAS Component!',
        filesToPlot: [],
        fileToPlot: null,
        fileToFit: null,
        fileFitChoice: [],
        selectedData: [],
        filterBy: 'All',
        sortBy: 'ascending',
        disable: true,
        currentData: {},
        currentConfiguration: {
            fit: 'Linear',
            equation: 'm*x+b',
            yTransformation: 'y',
            xTransformation: 'x',
            eTransformation: "e",
            yLabel: "I",
            xLabel: "Q",
            note: ""
        },
        fields: {
            x: 'pt.',
            y: 'detector'
        },
        scales: {
          x: d3.scaleLinear(),
          xType: 'X',
          y: d3.scaleLinear(),
          yType: 'Y'
        },
        ID: 'TAS',
    }
}