import * as d3 from 'd3';

export const drawPlot = {
    methods: {
        drawPlot(parameters) {
            

            let vm = this;

            vm.plotParameters = _.cloneDeep(parameters);
            vm.plotData = _.cloneDeep(parameters.data.data);

            this.labels.y = parameters.labels.y;
            this.labels.x = parameters.labels.x;
            
            if (!d3.select('.chart-' + vm.ID).empty()) {

                // Assign fields if none were provided yet
                vm.initFields();

                this.plotData = this.plotData.map(function(el) {
                    return {x: el[vm.fields.x], y: el[vm.fields.y]};
                })

                vm.adjustDomains();

                vm.updatePlot();

                return;
            }

            // console.log("Draw plot...");

            vm.initDimensions();

            // Assign fields if none were provided yet
            vm.initFields();

            this.plotData = this.plotData.map(function(el) {
                return {x: el[vm.fields.x], y: el[vm.fields.y]};
            })

            vm.initScales();

            vm.setElements();
            vm.addLabels(false);

            // set responsive
            vm.setResponsive();

            // Set zoom on zoomWindow
            vm.elements.svg.select(".zoom").call(vm.zoom);

            vm.updatePlot();
        }
    }
}