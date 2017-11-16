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
        field: {
            x: 'pt.',
            y: 'detector'
        },
        scale: {
          x: d3.scaleLinear(),
          xType: 'X',
          y: d3.scaleLinear(),
          yType: 'Y'
        },
        ID: 'TAS',
        selectedData: [],
    }
}