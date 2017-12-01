import * as d3 from 'd3';
import _ from 'lodash';

// The eventBus serves as the means to communicating between components.
import { eventBus } from '../../../assets/javascript/eventBus';

export const brush = {
    methods: {
        newBrush() {
            let vm = this;

            // console.log("new brush");
            var brush = d3.brushX()
                .extent([[0, 0], [vm.dimensions.w, vm.dimensions.h]])
                .on("start", brushstart)
                .on("brush", brushed)
                .on("end", brushend);

            vm.brushObj.brushes.push({id: vm.brushObj.brushes.length, brush: brush, selection: undefined});

            function brushstart() {
                // Brush start here
            };

            function brushed() {

                /**** Add brush label */

                let d = d3.select(this).data()[0];
                
                let bTitle = d3.select(this).selectAll("text").data([d.id]);
                
                bTitle.enter().append("text").text(function(d) { return "selection-" + d; })
                    .attr("id", "selection-label-" + d.id)
                    .attr("x", -5);

                d3.select(this).select("#selection-label-" + d.id)
                    .attr("dy", "0.75em")
                    .attr("transform", "rotate(-90)")
                    .attr("y", d3.event.selection[0] + 5);

                /*** End add brush label */

                let rawSelection = d3.event.selection;
                let convertedSelection = d3.event.selection.map(i => vm.scale.brushX.invert(i));

                // this is to let Vue able to watch dynamic changes to brush selections
                // that way they can be printed in the table with a computed property.
                let tobj = { [this.id]: {
                    raw: rawSelection,
                    converted: convertedSelection
                }};

                vm.brushObj.brushSelections = Object.assign({}, vm.brushObj.brushSelections, tobj);
                // console.log("Selections are: ", brushObj.brushSelections);
                // console.log("ID:", this.id);
            }

            function brushend() {
                // Figure out if our latest brush has a selection
                var lastBrushID = vm.brushObj.brushes[vm.brushObj.brushes.length - 1].id;
                var lastBrush = document.getElementById('selection-' + lastBrushID);
                var selection = d3.brushSelection(lastBrush);

                if (selection === null)	d3.select("#selection-label-" + lastBrushID).remove();

                if (selection && selection[0] !== selection[1]) {
                    vm.brushObj.brushes[vm.brushObj.brushes.length-1].selection = [vm.scale.x.invert(selection[0]), vm.scale.x.invert(selection[1])];
                    // console.log("Brushes:", brushes);
                }

                // If it does, that means we need another one
                if (vm.brushObj.brushes.length < vm.brushObj.brushCount && selection && selection[0] !== selection[1]) {
                    vm.newBrush();
                }

                // Always draw brushes
                vm.drawBrushes();
            }
        },
        drawBrushes() {
            let vm = this;
            
            // var brushSelection = vm.brushObj.brushGroup
            let brushSelection = vm.chart.g.select('#zoom-group-' + vm.ID).select('.brushes')
                .selectAll('.brush')
                .data(vm.brushObj.brushes, function (d) { return d.id; });

            // Set up new brushes
            brushSelection.enter()
                .insert("g", '.brush')
                .attr('class', 'brush')
                .attr('id', function(brush) { return "selection-" + brush.id; })
                .each(function(brushItem) {
                    // call the brush
                    brushItem.brush(d3.select(this));

                    if (brushItem.selection !== undefined){
                        brushItem.brush.move(d3.select(this), brushItem.selection.map(vm.scale.brushX));
                    }
                });

            brushSelection.each(function (brushItem) {

                d3.select(this)
                    .attr('class', 'brush')
                    .selectAll('.overlay')
                    .style('pointer-events', function() {

                        var brush = brushItem.brush;

                        if (brushItem.id === vm.brushObj.brushes.length-1 && brush !== undefined) {
                            return 'all';
                        } else {
                            return 'none';
                        }
                    });
            })

            brushSelection.exit().remove();
        },
        removeBrushes() {
            let vm = this;

            // vm.brushObj.brushGroup.selectAll('.brush').remove();
            vm.chart.g.select('#zoom-group-' + vm.ID).select('.brushes').selectAll('.brush').remove();
    
            vm.brushObj.brushes = [];
            vm.brushObj.brushSelections = {};
            
            if (vm.brushObj.brushCount >= 1) {
                vm.newBrush();
                vm.drawBrushes();
            }
            
            vm.toggleEdit(vm.toggleChoice);
        },
        sortBrushes() {
            let vm = this;
            // The object will be turned to an order array,
            // because objects do not promise an exact order like arrays.
    
            var sorted = _.toPairs(_.cloneDeep(vm.brushObj.brushSelections));
    
            sorted.sort(function(a,b) {
                return a[1].raw[0] - b[1].raw[0];
            })
    
            return sorted;
        },
        drawSavedBrushes() {
            let vm = this;
            // console.log("Drawing saved brushes...", savedSelections);
        
            for (let key in vm.savedSelections) {
                let tempExtent = [vm.savedSelections[key].converted[0], vm.savedSelections[key].converted[1]];
                // console.log("Temp extent:", tempExtent);
            }
            
            // console.log("Saved brushes:", savedBrushes);
            
            vm.brushObj.brushes = [];
            vm.brushObj.brushSelections = {};
        
            vm.chart.g.select('.brushes').selectAll('.brush').remove();
            
            let selected = vm.chart.g.select('.brushes').selectAll('.selected'); //document.getElementsByClassName('selected');
            selected.classed('selected', false);
            
            // while(selected.length) {
            //     selected[0].classList.remove('selected');
            // }
        
            if (vm.brushObj.brushCount < vm.savedBrushes.length) {
                let errorMsg = "<strong>Warning!</strong> The brush settings were for 3 curves. There are only " + (vm.brushObj.brushCount + 1) + " curves. Please plot 3 curves, or re-draw brushes for current curves.";
    
                eventBus.$emit('error-message', errorMsg, 'warning');
                
                vm.newBrush();
                vm.drawBrushes();
                vm.toggleEdit(vm.toggleChoice);
                
            } else if (Object.keys(vm.savedSelections).length === 0) {
                let errorMsg = "<strong>Warning!</strong> Unable to draw brushes. No brushes were stored.";
                
                eventBus.$emit('error-message', errorMsg, 'warning');
    
                vm.brushObj.brushes = _.cloneDeep(vm.savedBrushes);
                vm.brushObj.brushSelections = _.cloneDeep(vm.savedSelections);
    
                vm.newBrush();
                vm.drawBrushes();
                
                vm.toggleEdit(vm.toggleChoice);
            } else {
    
                vm.brushObj.brushes = _.cloneDeep(vm.savedBrushes);
                vm.brushObj.brushSelections = _.cloneDeep(vm.savedSelections);
    
                vm.drawBrushes();
                vm.toggleEdit(vm.toggleChoice);
            }
        },
        updateBrushScale() {
            let vm = this;

            let t = d3.zoomTransform( vm.chart.g.select('#zoom-group-' + vm.ID).select('.zoom').node()); 
            let new_xScale = t.rescaleX(vm.scale.x);
            
            // Update brush scale
            vm.scale.brushX = new_xScale.copy();
        }
    }
}