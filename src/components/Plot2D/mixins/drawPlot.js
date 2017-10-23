import * as d3 from 'd3';

export const drawPlot = {
    methods: {
        drawPlot(data, settings) {
            let vm = this;

            vm.binSize = _.cloneDeep(settings.binSize);
            var transformType = _.cloneDeep(settings.intensityTransformation);

            // console.log("These are the plot params", this.plotParams);
            vm.plotData = _.cloneDeep(data);
            
            // Filter invalid data points
            vm.plotData = vm.plotData.filter(el => Number.isFinite(el.qx) && Number.isFinite(el.qy) && Number.isFinite(el.intensity) && Number.isFinite(el.error));

            // If plot is already present, simply update with the new set of data
            if (!d3.select(".chart-2D").empty()) {
                // Transform data if log transform
                checkTransformType(transformType);
                
                vm.updatePlot(vm.plotData, vm.binSize, transformType);
                return;
            }

            // Transform data if log transform
            checkTransformType(transformType);

            // Add tool tip and hide it until invoked
            vm.elements.tooltip = d3.select("#app-container").append("div")
                .attr("class", "tooltip-2D")
                .style("opacity", 0);

            // set dimensions            
            vm.initDimensions();

            // Set plot scales
            vm.initScales();

            // Set plot area
            vm.setElements();

            // set responsive
            vm.setResponsive();

            // Update/generate plot with data
            vm.updatePlot(vm.plotData, vm.binSize, transformType);

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