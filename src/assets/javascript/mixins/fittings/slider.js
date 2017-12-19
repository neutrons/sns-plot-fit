import * as d3 from 'd3';
import fd from './fitData.js';
import extent from '../chartFuncs/extent.js';

/* Import Event Bus */
import { eventBus } from '../../eventBus';

export const slider = {
    methods: {
        initSlider() {
            let vm = this;
        
            vm.margin2 = {
                top: 5,
                right: 50,
                bottom: 70,
                left: 75
            };

            vm.dimensions.h2 = 25;

            // Set scales
            vm.scale.x2 = vm.plotParameters.scale.x;

            vm.scale.x2.range([0,vm.dimensions.w]);
            vm.scale.x2.domain(extent(vm.dataNest, 'x'));

            vm.axis.x2 = d3.axisBottom(vm.scale.x2);
    
            let slider = vm.chart.svg.append("g")
                .attr("class", "slider")
                .attr("transform", "translate(" + vm.margin2.left + "," + (vm.dimensions.h + vm.margin2.top + vm.margin2.bottom) + ")");
    
            vm.brushObj.brush = d3.brushX()
                .extent([
                    [0, 0],
                    [vm.dimensions.w, vm.dimensions.h2]
                ]);
    
            // append scatter plot to brush chart area
            slider.append("g").attr("class", "slider-lines")
    
            slider.append("g")
                .attr("class", "brush")
            
            slider.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + vm.dimensions.h2 + ")");
        },
        updateSlider() {
            let vm = this;

            //console.log("Updating slider...", vm.plotData.length);
            
            vm.dataToFit = vm.dataNest.filter(el => { if (el.key === vm.plotParameters.fileToFit)  return el.values; })[0].values;
            
            vm.fitResults = fd.fitData(vm.dataToFit, vm.plotParameters.fitConfiguration.equation, {settings: vm.plotParameters.fitConfiguration.settings, initialValues: vm.plotParameters.fitConfiguration.initialValues});
            this.updateFitResults();

            vm.scale.x2.domain( extent(vm.dataNest, 'x') ).nice();
            let new_xScale2 = vm.scale.x2.copy();

            // update brush x scale axis
            vm.axis.x2.scale(new_xScale2);
            
            // visually reflect the newly updated x axis
            vm.chart.svg.select('.slider').select('.axis--x').transition().duration(750).call(vm.axis.x2);

            let selectSlider = vm.chart.svg.select('.slider').select(".slider-lines").selectAll("line").data(vm.dataToFit);

            // EXIT old brush lines
            selectSlider.exit().remove();
            
            // UPDATE brush lines
            selectSlider.transition().duration(750)
                .attr("x1", function(d) { return new_xScale2(d.x); })
                .attr("y1", vm.dimensions.h2)
                .attr("x2", function(d) { return new_xScale2(d.x); })
                .attr("y2", 0);
            
            // ENTER new brush lines
            selectSlider.enter()
                .append("line")
                .attr('class', 'dotslider')
                .attr("x1", function(d) { return new_xScale2(d.x); })
                .attr("y1", vm.dimensions.h2)
                .attr("x2", function(d) { return new_xScale2(d.x); })
                .attr("y2", 0)
                .style("stroke", "slategray");

            // Call brush
            vm.brushObj.brush.on("brush", vm.brushed);

            // set initial brushSelection
            let xExtent = d3.extent(vm.dataToFit, function(d) { return d.x;});

            if (vm.brushObj.brushSelection.length === 0 || !_.isEqual(xExtent, vm.brushObj.prevExtent) || !(vm.plotParameters.fileToFit === vm.brushObj.brushFile) || !(vm.brushObj.brushTransformation === vm.plotParameters.fitConfiguration.transformations.x)) {

                setBrushLimits(xExtent, new_xScale2);

                vm.brushObj.prevExtent = xExtent;
                vm.brushObj.brushFit = vm.plotParameters.fitConfiguration.fit;
                vm.brushObj.brushFile = vm.plotParameters.fileToFit;
                vm.brushObj.brushTransformation = vm.plotParameters.fitConfiguration.transformations.x;

            } else if (!(vm.brushObj.brushFit === vm.plotParameters.fitConfiguration.fit)) { // if same file to fit, but new fit transformation, change brush selections

                setBrushLimits(xExtent, new_xScale2)
                vm.brushObj.brushFit = vm.plotParameters.fitConfiguration.fit;   
            } else { // if same file to fit after update and same fit transformation, simply update brush selection to current selection

                setBrushLimits(vm.selLimits, new_xScale2);
            }

            vm.chart.svg.select('.brush')
                .call(vm.brushObj.brush)
                .call(vm.brushObj.brush.move, vm.brushObj.brushSelection); 
                
            // brush.move allows you to set the current selection for the brush element
            // this will dynamically update according to the last selection made.
            // This is to allow for persistent selections upon the plot being re-drawn.
            function setBrushLimits(limits, scale) {
                vm.brushObj.brushSelection[0] = scale(limits[0]);
                vm.brushObj.brushSelection[1] = scale(limits[1]);
            }
        },
        brushed() {
            let vm = this;
            
            // console.log("Calling brush...");
            vm.brushObj.brushSelection = d3.event.selection;
            
            var e = d3.event.selection.map(vm.scale.x2.invert, vm.scale.x2);
            
            let selectedData = vm.dataToFit.filter(function(d) {
                return e[0] <= d.x && d.x <= e[1];
            })

            // Update brush selections to the current selected data
            // This will be used to dynamically adjust brush location when new data is added
            vm.selLimits = d3.extent(selectedData, function(d) { return d.x; });

            if (vm.brushObj.brushSelection !== null && selectedData.length > 1) {

                vm.chart.svg.select('.slider').selectAll(".dotslider")
                    .style("stroke", function (d) {
                        if(e[0] <= d.x && d.x <= e[1]) {
                            return d.color = vm.color(d.name);
                        } else {
                            return "slategray";
                        }
                    })
        
                vm.fitResults = fd.fitData(selectedData, vm.plotParameters.fitConfiguration.equation, {settings: vm.plotParameters.fitConfiguration.settings, initialValues: vm.plotParameters.fitConfiguration.initialValues});
                this.updateFitResults();

                if(vm.fitData.length <= 0) {
                    if(vm.checkError()) {
                        let errorMsg = "<strong>Error!</strong> Fitted y-values < 0, thus no fit-line to display.";
                        eventBus.$emit('error-message', errorMsg, 'danger');
                    }
                }

                // Add line plot
                vm.chart.g.select(".fitted-line").data([vm.fitData])
                    .attr("d", vm.line);

            } else {
                // Notify user that more data needs to be selected for the fit
                if (vm.checkError()) {
                    let errorMsg = "<strong>Error!</strong> Not enough data selected, please select 2 or more points. If plot is blank, no data is available for generating a fit line.";
                    eventBus.$emit('error-message', errorMsg, 'danger');
                }
            }
        },
        updateFitResults() {
            let tempIV = [];

            // console.log('updateFitResults', this.fitResults.paramVals);
            this.plotParameters.fitConfiguration.initialValues = _.cloneDeep(this.fitResults.paramVals);
            this.fitData = this.fitResults.fittedData;
            this.fitError = this.fitResults.error;
        }
    }
}