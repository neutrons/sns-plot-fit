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
            
            if (!d3.select('.chart-' + vm.ID).empty() && vm.isFit === vm.prevFit) {

                vm.updateChart(vm.plotParameters.data);

                // if a fit is selected add/update data
                if (vm.isFit) { 
                    vm.updateSlider(); 
                    vm.updateFitLine(); 
                }

                return;
            } else { // New fit is being selected so tear down plot and re-do everything from scratch
                d3.select(".chart-" + this.ID).remove();
                d3.select(".tooltip-" + this.ID).remove();
                vm.selLimits = [];
                vm.brushObj.brushSelection = [];
                vm.brushObj.brushFile = undefined;
            }

            // Set chart dimensions
            vm.initDimensions(function(viewHeight) {
                if (vm.isFit) {
                    vm.margin = {
                        top: 50,
                        right: 50,
                        bottom: 130, // adjusts margin for slider
                        left: 75
                    };
                    
                    vm.dimensions.h = viewHeight - vm.margin.top - vm.margin.bottom;
                } else {
                    vm.margin = {
                        top: 20,
                        right: 50,
                        bottom: 75,
                        left: 75
                    };
        
                    vm.dimensions.h = viewHeight - vm.margin.top - vm.margin.bottom;
                }
            });

            // Set scales & grids
            vm.initScales();
            vm.initAxes();
            vm.initColorScale();
            vm.initGrids();

            // Set initial Elements
            vm.setChartElements();

            // Add a group element for error bars
            vm.chart.g.select('.chart-elements').call(vm.addErrorGroup);
            
            vm.addLabels();

            vm.prevFit = vm.isFit;

            // If fit is selected initialize a slider and fit line elements
            if (vm.isFit) { 
                vm.initSlider(); 
                vm.initFitLine(); 
            }
            
            // Set zoom on zoomWindow
            vm.chart.g.select(".zoom").call(vm.zoom);

            // Create a responsive chart
            vm.setResponsive();

            // Lastly, update plot with data
            if (vm.isFit)  vm.updateSlider();

            vm.updateChart(vm.dataNest);

            // if a fit is selected add/update data
            if (vm.isFit)  vm.updateFitLine();
        }
    }
}