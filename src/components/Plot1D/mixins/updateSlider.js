import * as d3 from 'd3';
import fd from '../../../assets/javascript/fitData.js';
import extent from '../../../assets/javascript/mixins/chart/extent.js';

export const updateSlider = {
    methods: {
        updateSlider() {
            let vm = this;

            //console.log("Updating slider...", vm.plotData.length);
            
            vm.dataToFit = vm.dataNest.filter(el => { if (el.key === vm.plotParameters.fileToFit)  return el.values; })[0].values;
            
            vm.fitResults = fd.fitData(vm.dataToFit, vm.plotParameters.fitConfiguration.equation, vm.plotParameters.fitSettings);
            vm.coefficients = vm.fitResults.coefficients;
            vm.fitData = vm.fitResults.fittedData;
            vm.fitError = vm.fitResults.error;

            vm.scale.x2.domain( extent(vm.dataNest, 'x') ).nice();
            let new_xScale2 = vm.scale.x2.copy();

            // update brush x scale axis
            vm.axis.x2.scale(new_xScale2);
            
            // visually reflect the newly updated x axis
            vm.elements.slider.select('.axis--x').transition().duration(750).call(vm.axis.x2);

            let selectSlider = vm.elements.slider.select("#slider-lines").selectAll("line").data(vm.dataToFit);

            selectSlider.transition().duration(750)
                .attr("x1", function(d) { return new_xScale2(d.x); })
                .attr("y1", vm.dimensions.h2)
                .attr("x2", function(d) { return new_xScale2(d.x); })
                .attr("y2", 0);
            
            // enter new brush lines
            selectSlider.enter()
                .append("line")
                .attr('class', 'dotslider')
                .attr("x1", function(d) { return new_xScale2(d.x); })
                .attr("y1", vm.dimensions.h2)
                .attr("x2", function(d) { return new_xScale2(d.x); })
                .attr("y2", 0)
                .style("stroke", "slategray");

            // remove any old brush lines
            selectSlider.exit().remove();

            // Call brush
            vm.brushObj.brush.on("brush", vm.brushed);

            // set initial brushSelection
            if(vm.brushObj.brushSelection.length === 0 || !(vm.plotParameters.fileToFit === vm.brushObj.brushFile) || !(vm.brushObj.brushTransformation === vm.plotParameters.fitConfiguration.xTransformation)) {

                let xExtent = d3.extent(vm.dataToFit, function(d) { return d.x;});
                
                // vm.brushObj.brushSelection[0] = new_xScale2(xExtent[0]);
                // vm.brushObj.brushSelection[1] = new_xScale2(xExtent[1]);
                setBrushLimits(xExtent, new_xScale2);

                vm.brushObj.brushFit = vm.plotParameters.fitConfiguration.fit;
                vm.brushObj.brushFile = vm.plotParameters.fileToFit;
                vm.brushObj.brushTransformation = vm.plotParameters.fitConfiguration.xTransformation;

            } else if (!(vm.brushObj.brushFit === vm.plotParameters.fitConfiguration.fit)) { // if same file to fit, but new fit transformation, change brush selections

                let xExtent = d3.extent(vm.dataToFit, function(d) { return d.x;});
                
                // vm.brushObj.brushSelection[0] = new_xScale2(xExtent[0]);
                // vm.brushObj.brushSelection[1] = new_xScale2(xExtent[1]);
                setBrushLimits(xExtent, new_xScale2)
                vm.brushObj.brushFit = vm.plotParameters.fitConfiguration.fit;   
            } else { // if same file to fit after update and same fit transformation, simply update brush selection to current selection
                // vm.brushObj.brushSelection[0] = new_xScale2(vm.selLimits.xMin);
                // vm.brushObj.brushSelection[1] = new_xScale2(vm.selLimits.xMax);
                setBrushLimits(vm.selLimits, new_xScale2);
            }

            vm.elements.slider.select('.brush')
                .call(vm.brushObj.brush)
                .call(vm.brushObj.brush.move, vm.brushObj.brushSelection); 
            // brush.move allows you to set the current selection for the brush element
            // this will dynamically update according to the last selection made.
            // This is to allow for persistent selections upon the plot being re-drawn.


            function setBrushLimits(limits, scale) {
                vm.brushObj.brushSelection[0] = scale(limits[0]);
                vm.brushObj.brushSelection[1] = scale(limits[1]);
            }
        }
    }
}