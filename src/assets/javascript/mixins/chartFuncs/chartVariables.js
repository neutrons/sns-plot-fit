export const chartVariables = {
    data() {
        return {
            chart: {
                svg: undefined,
                g: undefined,
                tooltip: undefined,
            },
            dimensions: {
                w: 960,
                h: 600,
                viewbox: undefined,
                aspectW: 16,
                aspectH: 9
            },
            margin: {
                top: 20,
                right: 65,
                bottom: 50,
                left: 65
            },
            scale: {
                x: undefined,
                xType: 'X',
                y: undefined,
                yType: 'Y'
            },
            axis: {
                x: undefined,
                y: undefined,
            },
            grid: {
                x: undefined,
                y: undefined,
            },
            label: {
                x: 'X',
                y: 'Y'
            },
            color: undefined,
            line: undefined,
            plotParameters: undefined,
            plotData: undefined,
            dataNest: [],
            prevKeys: []
        }
    }
}
