import * as d3 from 'd3';

export const drawChart = {
    methods: {
        drawChart(data, settings) {
            let vm = this;

            vm.binSize = _.cloneDeep(settings.binSize);
            var transformType = _.cloneDeep(settings.intensityTransformation);

            // console.log("These are the plot params", this.plotParams);
            vm.plotData = _.cloneDeep(data);
            
            // Filter invalid data points
            vm.plotData = vm.plotData.filter(el => Number.isFinite(el.qx) && Number.isFinite(el.qy) && Number.isFinite(el.intensity) && Number.isFinite(el.error));

            // If plot is already present, simply update with the new set of data
            if (!d3.select(".chart-" + vm.ID).empty()) {
                // Transform data if log transform
                checkTransformType(transformType);
                
                vm.updateChart(vm.plotData, vm.binSize, transformType);
                return;
            }

            // Transform data if log transform
            checkTransformType(transformType);

            // set dimensions            
            vm.initDimensions();

            // Set plot scales and axes
            vm.initScales();
            vm.initAxes();

            // Set plot area
            vm.setChartElements();
            vm.addLabels();

            // Set zoom on zoomWindow
            vm.chart.g.call(vm.zoom);

            // set responsive
            vm.setResponsive();

            // Update/generate plot with data
            vm.updateChart(vm.plotData, vm.binSize, transformType);

            function checkTransformType(type) {
                
                if (transformType === "Log") {
                    // console.log("Transforming Hex Data...");
                    vm.plotData = vm.plotData.filter(el => el.intensity > 0);

                    vm.plotData.forEach(function(el) {
                        el.intensity = Math.log(el.intensity);
                    });
                }
            }
        }
    }
}