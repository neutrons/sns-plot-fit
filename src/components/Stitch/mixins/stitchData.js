import * as d3 from 'd3';

import interpolate from './interpolateLine.js';

export const stitchData = {
    methods: {
        stitchData() {
            let vm = this;

            let selectedData = vm.selectData();
            // console.log("Selected:", selectedData);
    
            //Run tests to check if appropriate brush selections are made
            if( selectedData.length === 0 ) {
                console.log("Re-draw brushes.");   
                return false;         
            } else if (vm.validateSelections(selectedData)) {
                console.log("Re-draw brushes.");
                return false;
            } else {
                // console.log("Selected Data: ", selectedData);
                
                // Now interpolate data
                let line = interpolate.linear(selectedData);
    
                // Put the line onto the plot
                vm.addStitch(line);
    
                return true;
            }
        }
    }
}

export const addStitch = {
    methods: {
        addStitch(line) {
            let vm = this;

            // First repackage data to an array of objects per points for d3 to work with
            let newData = [];

            for (let i = 0, len = line.x.length; i < len; i++) {
                
                newData.push({
                    x: line.x[i],
                    y: line.y[i],
                    e: line.e[i]
                });
            }

            vm.stitchLineData = _.cloneDeep(newData);

            // If first time plotting stitch line, draw path with animation from start to end
            if (vm.elements.svg.select("#stitched-line").empty()) {
                
                vm.elements.stitch = vm.elements.plot.append("g")
                    .attr("clip-path", "url(#clip-" + vm.ID + ")")
                    .attr("id", "stitched-line")    
                    .append('path')
                        .datum(newData)
                        .attr("class", "pointlines")
                        .attr("d", vm.line)
                        .style("fill", "none")
                        .style("stroke", "red")
                        .style("stroke-width", "2px");

                var totalLength = vm.elements.stitch.node().getTotalLength();
                
                vm.elements.stitch.attr("stroke-dasharray", totalLength + " " + totalLength)
                        .attr("stroke-dashoffset", totalLength)
                        .transition()
                            .duration(4000)
                            .ease(d3.easePolyInOut)
                            .attr("stroke-dashoffset", 0)
                            .on('end', function() {
                                vm.elements.stitch.attr("stroke-dasharray", "4,4")
                            }); // Change to dash line one finished drawing path

            } else {
                // if updating current stitched line, simply transition to new path, no animate start to end
                vm.elements.stitch.datum(newData)
                    .transition().duration(1500)
                    .attr("d", vm.line);
            }

        }
    }
}

export const removeStitchLine = {
    methods: {
        removeStitchLine() {
            d3.select("#stitched-line").remove();
            
            return false;
        }
    }
}

export const selectData = {
    methods: {
        selectData() {
            let vm = this;

            // If there are no brush selections, don't bother matching the data
            if (vm.validateBrushes()) return [];

            let matches = [];
            let allData = vm.formatData(vm.dataNest); // An array of all data sorted left to right by x axis values
            // console.log("All data:", allData);

            // First sort brushes so that selections are made left to right
            let sortedBrushes = vm.sortBrushes(); // an array of sorted brush selections
            // console.log("Sorted Brushes:", sortedBrushes);

            for ( let i = 0, len = sortedBrushes.length; i < len; i++) {
                let start = sortedBrushes[i][1].converted[0];
                let end = sortedBrushes[i][1].converted[1];

                let tempSelection = [];

                for (let j = 0, len = allData.length; j < len; j++) {
                    
                    // Temp data is cloned so original array is not referenced
                    // If not cloned, the stitching function will not work properly because
                    // each brush selection reference the same curve...hence the same data will
                    // get altered when shifting during the interpolation process.
                    let tempData = _.cloneDeep(allData[j][1]);
                    let tempName = allData[j][0];

                    let firstValue = tempData.x[0];
                    let lastValue = tempData.x[tempData.x.length - 1];

                    // console.log("Check: " + tempName, firstValue <= end && lastValue >= start);
                    if ( firstValue <= end && lastValue >= start ) {
                        let tempSelCurve = [tempName];
                        let tempSel = {x:[], y:[], e:[]};

                        for( let z = 0, len = tempData.x.length; z < len; z++ ) {
                            //let convertedX = scale.brushXScale(tempData.x[z]);
                            let convertedX = tempData.x[z];

                            if ( start <= convertedX && convertedX <= end ) {
                                //tempSelection[tempName] = tempSelection[tempName] || [];

                                // Add the x,y,e values to selection object
                                tempSel.x.push(tempData.x[z]);
                                tempSel.y.push(tempData.y[z]);
                                tempSel.e.push(tempData.e[z]);
                            }
                        }

                        tempSelCurve.push(tempData); // Add all data
                        tempSelCurve.push(tempSel); // Add selected data
                        
                        tempSelection.push(tempSelCurve);
                    }
                }

                tempSelection.push([start,end]); // Add Brush selections
                
                // Push Temp brush selection to match array
                matches.push(tempSelection);

            }

            return matches;
        }
    }
}