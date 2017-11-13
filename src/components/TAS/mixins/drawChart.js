import * as d3 from 'd3';

export const drawChart = {
    methods: {
        drawChart(parameters) {
            let vm = this;

            vm.plotParameters = _.cloneDeep(parameters);

            vm.dataNest = vm.plotParameters.data; //regular data to plot

            //Catch any empty data and throw an error
            if (vm.dataNest.length < 1) {
                console.log("No data! Error!");
                //Remove any elements previously plotted
                vm.resetData();
                
                return;
            }

            this.label.y = parameters.label.y;
            this.label.x = parameters.label.x;
            
            if (!d3.select('.chart-' + vm.ID).empty()) {

                vm.updateChart(vm.dataNest);

                return;
            } else { // New fit is being selected so tear down plot and re-do everything from scratch
                d3.select(".chart-" + this.ID).remove();
                d3.select(".tooltip-" + this.ID).remove();
            }

            // Set chart dimensions
            vm.initDimensions();

            // Set scales & grids
            vm.initScales();
            vm.initAxes();
            vm.initColorScale();
            vm.initGrids();

            // Set initial Elements
            vm.setChartElements();
            vm.addLabels();
            
            // Set zoom on zoomWindow
            vm.chart.g.select(".zoom").call(vm.zoom);

            // Create a responsive chart
            vm.setResponsive();

            vm.updateChart(vm.dataNest);
        }
    }
}