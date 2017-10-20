import * as d3 from 'd3';

export const drawPlot = {
    methods: {
        drawPlot() {
            let vm = this;
            
            // If plot is already present, simply update with the new set of data
            if (!d3.select(".chart-1D").empty() && vm.isFit === vm.prevFit) {
            
                // Update titles according to new transformations
                vm.labels.x = vm.plotParameters.fitConfiguration.xTransformation;
                vm.labels.y = vm.plotParameters.fitConfiguration.yTransformation;

                 // Lastly, update plot with data                
                vm.updatePlot(vm.plotParameters.data);
                // if a fit is selected add/update data
                if (vm.isFit) { vm.updateSlider(); vm.updateFitLine(); }

                return;
            } else { // New fit is being selected so tear down plot and re-do everything from scratch
                
                d3.select(".chart-1D").remove();
                d3.select("#tooltip-1D").remove();
                vm.selLimits = [];
                vm.brushObj.brushSelection = [];
                vm.brushObj.brushFile = undefined;
            }

            vm.dataNest = vm.plotParameters.data; //regular data to plot

            vm.labels.x = vm.plotParameters.fitConfiguration.xTransformation; //xTitle according to label
            vm.labels.y = vm.plotParameters.fitConfiguration.yTransformation; //yTitle according to label

            //Catch any empty data and throw an error
            if (vm.dataNest.length < 1) {
                console.log("No data! Error!");
                //Remove any elements previously plotted
                d3.select(".chart-1D").remove();
                d3.select("#tooltip-1D").remove();
                
                vm.isError = !vm.isError;
                
                if(vm.checkError()) {
                    let errorMsg = "<strong>Error!</strong> No data to plot...might be due to the fit transformation resulting in invalid values.";
                    eventBus.$emit('error-message', errorMsg, 'danger');
                }

                return;
            } else {
                vm.isError = false;
            }

            // Set plot dimensions
            vm.initDimensions();

            // Set scales
            vm.initScales();

            // Set initial Elements
            vm.setElements();

            vm.prevFit = vm.isFit;

            // If fit is selected initialize a slider and fit line elements
            if (vm.isFit) { 
                vm.initSlider(); 
                vm.initFitLine(); 
            }
            
            // Set zoom on zoomWindow
            vm.elements.svg.select(".zoom").call(vm.zoom);

            // Create a responsive chart
            vm.setResponsive();

            // Lastly, update plot with data
            if (vm.isFit)  vm.updateSlider();

            vm.updatePlot(vm.dataNest);

            // if a fit is selected add/update data
            if (vm.isFit)  vm.updateFitLine();
        }
    }
}