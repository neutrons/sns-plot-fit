import * as d3 from 'd3';

export const drawPlot = {
    methods: {
        drawPlot(parameters) {
            

            // let vm = this;

            // vm.plotParameters = _.cloneDeep(parameters);
            // vm.plotData = _.cloneDeep(parameters.data.data);

            // this.labels.y = parameters.labels.y;
            // this.labels.x = parameters.labels.x;
            
            // if (!d3.select('.chart-' + vm.ID).empty()) {

            //     // Assign fields if none were provided yet
            //     vm.initFields();

            //     this.plotData = this.plotData.map(function(el) {
            //         return {x: el[vm.fields.x], y: el[vm.fields.y]};
            //     })

            //     vm.adjustDomains();

            //     vm.updatePlot();

            //     return;
            // }

            // // console.log("Draw plot...");

            // vm.initDimensions();

            // // Assign fields if none were provided yet
            // vm.initFields();

            // this.plotData = this.plotData.map(function(el) {
            //     return {x: el[vm.fields.x], y: el[vm.fields.y]};
            // })

            // vm.initScales();

            // vm.setElements();
            // vm.addLabels(false);

            // // set responsive
            // vm.setResponsive();

            // // Set zoom on zoomWindow
            // vm.elements.svg.select(".zoom").call(vm.zoom);

            // vm.updatePlot();

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

            this.labels.y = parameters.labels.y;
            this.labels.x = parameters.labels.x;
            
            if (!d3.select('.chart-' + vm.ID).empty()) {

                vm.updatePlot(vm.plotParameters.data);

                return;
            } else { // New fit is being selected so tear down plot and re-do everything from scratch
                d3.select(".chart-" + this.ID).remove();
                d3.select(".tooltip-" + this.ID).remove();
            }

            // Set plot dimensions
            vm.initDimensions();

            // Set scales
            vm.initScales();

            // Set initial Elements
            vm.setElements();
            vm.addLabels();
            
            // Set zoom on zoomWindow
            vm.elements.svg.select(".zoom").call(vm.zoom);

            // Create a responsive chart
            vm.setResponsive();

            vm.updatePlot(vm.dataNest);
        }
    }
}