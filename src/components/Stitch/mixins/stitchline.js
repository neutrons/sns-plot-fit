import * as d3 from 'd3';
import $ from 'jquery';
import axios from 'axios';
import { eventBus } from '../../../assets/javascript/eventBus';

import interpolate from './interpolateLine.js';

export const stitchline = {
    methods: {
        saveStitchLine() {
            let vm = this;

            vm.saveConfirm( function(confirm){
                if (confirm){
                    $("#cancel-save-btn").off();
                    $("#save-btn").off();
                    
                    let filename = $('#file-name-input').val();
                    // console.log("Saving the file name: " + filename + "_Iq.txt");
                    $("#file-name-input").val('');
                    
                    
                    // console.log("Stitch Line Data:", stitchLineData);
                    // console.log("Calling axios.post to save new data file");
                    
                    axios.post('/external/save', {
                        id: filename + '_Iq.txt',
                        content: vm.stitchLineData
                    })
                    .then(function (response) {
                        console.log(response);
                        
                        // If posting stitch line works, store brush selections
                        vm.savedSelections = _.cloneDeep(vm.brushObj.brushSelections);
                        vm.savedBrushes = _.cloneDeep(_.reverse(vm.brushObj.brushes));
                    
                        // console.log("Saved brushes:", savedBrushes);
                        // console.log("-----------------------------")
    
                        // console.log("Here are your saved brush selections:")
                        // for(let key in savedSelections) {
                        //     console.log("Key: " + key);
                        //     console.log(savedSelections[key]);
                        //     console.log("---------------------------");
                        // }
    
                        // Then reset plot for next iteration of stitching
                        vm.brushObj.brushSelections = {};
                        vm.brushObj.brushes = [];
                        eventBus.$emit("reset-stitch");
    
                        // Then fetch data to include the saved stitch file
                        eventBus.$emit("fetch-files");
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
    
                    return;
                } else {
                    $("#cancel-save-btn").off();
                    $("#save-btn").off();
                    $('#file-name-input').val('');
    
                    // console.log("Not saving the file.");
                    return;
                }
            });
        },
        saveConfirm(callback){
            let vm = this;

            $("#saveModal").modal('show')
            
            $("#save-btn").on("click", function(){
    
                let filename = $('#file-name-input').val();
    
                if( !vm.isValidFilename(filename) ) {
                    $("#save-error-msg").show();
                } else {
                    callback(true);
                    $("#saveModal").modal('hide');
                    $("#save-error-msg").hide();
                }
    
            });
    
            $("#cancel-save-btn").on("click", function(){
                callback(false);
                $("#saveModal").modal('hide');
                $("#save-error-msg").hide();
            });
        },
        isValidFilename(fname) {
            var rg1=/^[^\\/:\*\?"<>\|  .]+$/; // forbidden characters \ / : * ? " < > |
            var rg2=/^[0-9]/; // cannot start with a number ([0-9])
            var rg3=/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names

            return rg1.test(fname)&&!rg2.test(fname)&&!rg3.test(fname);
        },
        updateStitchLine() {
            let vm = this;

            if (!d3.select("#stitched-line").empty()) {
                let t = d3.transition().duration(750);
                let stitch = vm.chart.g.select('#stitched-line');
                
                stitch.select('.stitch-path')
                    .transition(t)
                    .attr('d', vm.line);

                // Update error Line
                stitch.select('#stitch-error-line')
                    .selectAll('.error-line')
                    .call(vm.updateErrorLine, vm.scale.yType, vm.scale.x, vm.scale.y, t);

                // Update error cap Top
                stitch.select("#stitch-error-cap-top")
                    .selectAll("line")
                    .call(vm.updateErrorCaps, 'top', vm.scale.x, vm.scale.y, t)

                // Update error cap bottom
                stitch.select("#stitch-error-cap-bottom")
                    .selectAll("line")
                    .call(vm.updateErrorCaps, 'bottom', vm.scale.x, vm.scale.y, t)
            }
        },
        stitchData() {
            let vm = this;

            let selectedData = vm.selectData();
    
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
        },
        addStitch(line) {
            let vm = this;
            vm.$emit('is-stitched');
            // console.log('Line', line);

            // First repackage data to an array of objects per points for d3 to work with
            let newData = [];

            for (let i = 0, len = line.x.length; i < len; i++) {
                
                newData.push({
                    x: line.x[i],
                    y: line.y[i],
                    error: line.error[i]
                });
            }

            vm.stitchLineData = _.cloneDeep(newData);

            // If first time plotting stitch line, draw path with animation from start to end
            let t = d3.zoomTransform( vm.chart.g.select('.zoom').node());
            let new_yScale = t.rescaleY(vm.scale.y); 
            let new_xScale = t.rescaleX(vm.scale.x);

            if (vm.chart.g.select("#stitched-line").empty()) {
                
                let stitch = vm.chart.g.select('.chart-elements').insert('g', ':first-child')
                    .attr('clip-path', 'url(#clip-' + vm.ID + ')')
                    .attr('id', 'stitched-line');

                let stitchLine = stitch.append('path')
                    .data([newData])
                    .attr("class", "pointlines stitch-path")
                    .attr("d", vm.line)
                    .style("fill", "none")
                    .style("stroke", "red")
                    .style("stroke-dasharray", "4,4");

                // Add error lines
                let error = stitch.append('g').attr('id', '#stitch-error-' + vm.ID);
                
                error.append("g").attr("id", "stitch-error-line")
                    .selectAll('.error-line')
                    .data(newData)
                    .call(vm.errorbarLine, new_xScale, new_yScale);
                
                // Add error cap top
               error.append("g").attr("id", "stitch-error-cap-top")
                        .selectAll(".error-cap-top")
                        .data(newData)
                        .call(vm.errorCaps, 'top', new_xScale, new_yScale);
                
                // Add error cap bottom
                error.append("g").attr("id", "stitch-error-cap-bottom")
                        .selectAll(".error-cap-bottom")
                        .data(newData)
                        .call(vm.errorCaps, 'bottom', new_xScale, new_yScale);

                error.selectAll('.error-cap-top').style('stroke', 'red');
                error.selectAll('.error-cap-bottom').style('stroke', 'red');
                error.selectAll('.error-line').style('stroke', 'red');

            } else {
                let t = d3.transition().duration(1000);

                // if updating current stitched line, simply transition to new path, no animate start to end
                let stitch = vm.chart.g.select('#stitched-line');

                stitch.select('.stitch-path').data([newData])
                    .transition(t)
                    .attr('d', vm.line);

                // Update error Line
                stitch.select('#stitch-error-line')
                    .selectAll('.error-line')
                    .data(newData)
                    .call(vm.updateErrorLine, vm.scale.yType, new_xScale, new_yScale, t);

                // Update error cap Top
                stitch.select("#stitch-error-cap-top")
                    .selectAll("line")
                    .data(newData)
                    .call(vm.updateErrorCaps, 'top', new_xScale, new_yScale, t)

                // Update error cap bottom
                stitch.select("#stitch-error-cap-bottom")
                    .selectAll("line")
                    .data(newData)
                    .call(vm.updateErrorCaps, 'bottom', new_xScale, new_yScale, t)
            }

        },
        removeStitchLine() {
            d3.select("#stitched-line").remove();
            
            return false;
        },
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
                        let tempSel = {x:[], y:[], error:[]};

                        for( let z = 0, len = tempData.x.length; z < len; z++ ) {
                            //let convertedX = scale.brushXScale(tempData.x[z]);
                            let convertedX = tempData.x[z];

                            if ( start <= convertedX && convertedX <= end ) {
                                //tempSelection[tempName] = tempSelection[tempName] || [];

                                // Add the x,y,e values to selection object
                                tempSel.x.push(tempData.x[z]);
                                tempSel.y.push(tempData.y[z]);
                                tempSel.error.push(tempData.error[z]);
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