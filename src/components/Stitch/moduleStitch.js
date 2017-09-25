import * as d3 from 'd3';
import _ from 'lodash';
import $ from 'jquery';
import interpolate from './interpolateLine.js';

// The eventBus serves as the means to communicating between components.
// Here it's being used in moduleStitch to communicate to App.vue for error messages
import { eventBus } from '../../assets/javascript/eventBus';

var stitch = (function(d3, _, $, eventBus) {
    /******* Private Global Variables for Stitch Module **************/
        
        // Object for plot elements
        var elements = {
            svg: undefined,
            plot: undefined,
            axes: undefined,
            legend: undefined,
            errorLines: undefined,
            stitchy: undefined
        };

        // Object for plot scale functions
        var scale = {
            xScale: undefined,
            yScale: undefined,
            yScaleType: undefined,
            brushXScale: undefined,
        };

        // Object for dimensions
        var dim = {
            width: undefined,
            height: undefined
        }

        // Object for axis generators
        var axesObj = {
            xAxis: undefined,
            yAxis: undefined,
            xGridline: undefined,
            yGridline: undefined
        }

        // Object for brush elements
        var brushObj = {
            brushes: [],
            brushCount: null,
            brushSelections: {},
            brushGroup: undefined
        };

        // Object for Zoom behaviors
        var zoomObj = {
            zoom: undefined,
            zoomed: undefined
        }

        // Function for line generator
        var plotLine = undefined;

        // Toggle Value when switching between Zoom and Brush behaviors
        var toggleChoice = 'zoom';

        // Object for scatter data points
        var dataNest = undefined;

    /******* End of Global for Stitch Module **************/

    // Module object
    var my = {};

    // Toggle function
    my.toggleEdit = function(choice) {
        // console.log(this.value);
        toggleChoice = choice || this.value;
        
        if(toggleChoice === 'zoom') {
            // Toggle off all brushes
            for(let i = 0, len = brushObj.brushes.length; i < len; i++) {
                d3.select('#brush-'+i).on('.brush', null);
            }
            
            // Remove Brush Cursor Styles
            d3.select('.stitch-chart').style('cursor', 'move');
            d3.select('.brushes').selectAll('.selection').style("cursor", "initial");
            d3.select('.brushes').selectAll('.overlay').style("cursor", "move");

            elements.svg.call(zoomObj.zoom);
        } else if (toggleChoice === 'brush') {
            elements.svg.on('.zoom', null);
            
            // Toggle on all brushes
            for(let i = 0, len = brushObj.brushes.length; i < len; i++) {
                brushObj.brushes[i].brush(d3.select('#brush-'+i));
            }

            // Re-instate Brush Cursor Styles
            d3.select('.brushes').selectAll('.selection').style("cursor", "move");
            d3.select('.brushes').selectAll('.overlay').style("cursor", "crosshair");
        }
    }

    my.resetToggle = function() {
        toggleChoice = 'zoom';
    }

    // Plot function
    my.plot = function(parameters) {

            //Setting 'this' as global when calling vue data letiables inside nested functions
            let vm = this;

            //Remove any elements previously plotted
            d3.select(".stitch-chart").remove();
            
            let data = parameters.data; //regular data to plot
            // Filter any infinity values, null, or NaN before plotting, this will happen when transforming log data = 0
            data = data.filter((d) => Number.isFinite(d.y) && Number.isFinite(d.x));
           
            //Catch any empty data and throw an error
            if(data.length < 1) {
                console.log("No data! Error!");
                //Remove any elements previously plotted
                d3.select(".stitch-chart").remove();
                
                vm.isError = !vm.isError;
                
                if(vm.checkError()) {
                    let errorMsg = "<strong>Warning!</strong> No data to plot...might be due to the fit transformation resulting in invalid values.";
                    eventBus.$emit('error-message', errorMsg);
                }

                return;
            } else {
                vm.isError = false;
            }

            // Nest the entries by name
            dataNest = d3.nest()
                .key(function (d) {
                    return d.name;
                })
                .entries(data);

            // Set Color Scale
            let color = d3.scaleOrdinal(d3.schemeCategory20)
                .domain(parameters.colorDomain);

            // Set plot dimensions
            let containerWidth = document.getElementById("stitch-plot").offsetWidth; // Pull plot's parent container width, this will be used to scale the plot responsively
            let margin = { top: 80, right: 80, bottom: 80, left: 80 };
            let viewHeight = containerWidth / (16/9); // 16/9 is the aspect ratio
            let height = viewHeight - margin.top - margin.bottom;
            let width = containerWidth - margin.left - margin.right;
            let viewbox = "0 0 " + containerWidth + " " + viewHeight;
            dim.width = width;
            dim.height = height;
            
            // Set Scales
            scale.xScale = parameters.scales.xScale;
            scale.xScale.range([0,width]);
            scale.xScale.domain(d3.extent(data, function (d) {
                return d.x;
            }));

            scale.yScale = parameters.scales.yScale;
            scale.yScaleType = parameters.scales.yScaleType;
            scale.yScale.range([height, 0]);
            scale.yScale.domain(d3.extent(data, function(d) {
                return d.y;
            }));

            scale.brushXScale = scale.xScale; // Initially set brushXScale to xScale, it will be updated when zoom is activated below
            brushObj.brushCount = parameters.brushCount - 1;
            brushObj.brushes = [];
            brushObj.brushSelections = {};

            // Set Axes & Gridlines generators
            axesObj.xAxis = d3.axisBottom(scale.xScale).ticks(10);
            axesObj.yAxis = d3.axisLeft(scale.yScale).ticks(10);
            axesObj.xGridline = d3.axisBottom(scale.xScale).ticks(10).tickSize(-height).tickFormat("");
            axesObj.yGridline = d3.axisLeft(scale.yScale).ticks(10).tickSize(-width).tickFormat("");

            // Add main chart area
            elements.svg = d3.select("#stitch-plot").append("svg")
                .attr("viewBox", viewbox)
                .attr("perserveAspectRatio","xMidYMid meet")
                .attr("class", "stitch-chart")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            
            // Add clip path so points/line do not exceed plot boundaries
            elements.svg.append("defs").append("clipPath")
                .attr("id", "clipStitch")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            // Add plot area
            elements.svg.append("rect")
                .attr("class", "plotbg")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Add Axis and Gridline section
            elements.axes = elements.svg.append("g").attr("id", "axis-stitch");

            //Add Error-bars Section
            elements.errorlines = elements.svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            
            //Add Group to Plot Line/Points
            elements.plot = elements.svg.append("g")
                .attr("class", "chart");

            // Generate a SVG group to keep brushes
            brushObj.brushGroup = elements.svg.append('g')
                .attr("height", height)
                .attr("width", width)
                .attr("fill", "none")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("class", "brushes");

            // Only allow brushes when 2+ lines are plotted
            if(brushObj.brushCount >= 1) {
                my.newBrush();
                my.drawBrushes();
            }

            //Add a Line Plot Function
            plotLine = d3.line()
                .x(function (d) {
                    return scale.xScale(d.x);
                })
                .y(function (d) {
                    return scale.yScale(d.y);
                });

            // Create Zoom function
            zoomObj.zoom = d3.zoom().on('zoom', my.zoomed);

            // Add X Gridlines
            elements.axes.append("g")
                .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
                .attr("class", "gridline gridline--x")
                .call(axesObj.xGridline);

            // Add Y Gridlines
            elements.axes.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("class", "gridline gridline--y")
                .call(axesObj.yGridline);

            // Add X Axis
            elements.axes.append("g")
                .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
                .attr("class", "axis axis--x")
                .call(axesObj.xAxis);

            // Add Y Axis
            elements.axes.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("class", "axis axis--y")
                .call(axesObj.yAxis);
            
            // Add Y Axis Label
            elements.svg.append("g").append("text")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(25," + (height/2) + ") rotate(-90)")
                .attr("id", "yLabelStitch")
                .text("Y");

            // Add X Axis Label
            elements.svg.append("g").append("text")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(" + ((width+margin.left+margin.right)/2) + "," + (height+margin.top+margin.bottom/2) + ")")
                .attr("id", "xLabelStitch")
                .text("X");


            // Add Chart Title
            elements.svg.append("g").append("text")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(" + ((width+margin.left+margin.right)/2) + ",35)")
                .attr("id", "plotTitleStitch")
                .text("Y vs X");
                
            // Loop through each name / key
            dataNest.forEach(function (d, i) {

                // Add line plot
                elements.plot.append("path")
                    .attr("clip-path", "url(#clipStitch)")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .datum(d.values)
                    .attr("class", "pointlines")
                    .attr("d", plotLine)
                    .style("fill", "none")
                    .style("stroke", function () {
                        return d.color = color(d.key);
                    });;

                // Add error lines
                elements.errorlines.append("g")
                    .selectAll(".error")
                    .data(d.values)
                    .enter()
                    .append('line')
                    .attr("clip-path", "url(#clipStitch)")
                    .attr('class', 'error')
                    .attr('x1', function (d) {
                        return scale.xScale(d.x);
                    })
                    .attr('x2', function (d) {
                        return scale.xScale(d.x);
                    })
                    .attr('y1', function (d) {
                        return scale.yScale(d.y + d.e);
                    })
                    .attr('y2', function (d) {
                        if(d.y - d.e < 0 && scale.yScaleType === "Log(Y)") {
                            return scale.yScale(d.y)
                        } else {
                            return scale.yScale(d.y - d.e);
                        }
                    })
                    .style("stroke", function () {
                        return d.color = color(d.key);
                    });

                    // Add error tick top
                    // When calculating error capsizes, the '4' is chosen to match
                    // the radius of the points, which is also 4 pixels.
                    // The reason to +/- after scaling is the xScale(d.x) takes the
                    // data value and converts it to a pixel value, thus subtracting by same units:
                    // xScale(d.x) - 4 = pixel_value - pixel_value
                    // This leads to uniform capsizes no matter the scaling/transforming of data,
                    // which is not the case if xScale(d.x - 4) is used.
                    elements.errorlines.append("g")
                        .selectAll(".error-tick-top")
                        .data(d.values)
                        .enter()
                        .append('line')
                            .attr("clip-path", "url(#clipStitch)")
                            .attr('class', 'error-tick-top')
                            .attr('x1', function (d) {
                                return scale.xScale(d.x) - 4;
                            })
                            .attr('x2', function (d) {
                                return scale.xScale(d.x) + 4;
                            })
                            .attr('y1', function (d) {
                                return scale.yScale(d.y + d.e);
                            })
                            .attr('y2', function (d) {
                                return scale.yScale(d.y + d.e);
                            })
                            .style("stroke", function () {
                                return d.color = color(d.key);
                            });

                    // Add error tick bottom
                    elements.errorlines.append("g")
                        .selectAll(".error-tick-bottom")
                        .data(d.values)
                        .enter()
                        .append('line')
                            .attr("clip-path", "url(#clipStitch)")
                            .attr('class', 'error-tick-bottom')
                            .filter( function(d) {
                                if(scale.yScaleType === "Log(Y)") {
                                    return d.y - d.e > 0;
                                } else {
                                    return true;
                                }
                            })
                            .attr('x1', function (d) {
                                return scale.xScale(d.x) - 4;
                            })
                            .attr('x2', function (d) {
                                return scale.xScale(d.x) + 4;
                            })
                            .attr('y1', function (d) {
                                return scale.yScale(d.y - d.e);
                            })
                            .attr('y2', function (d) {
                                return scale.yScale(d.y - d.e);
                            })
                            .style("stroke", function () {
                                return d.color = color(d.key);
                            });

                    // Add Scatter plot
                    elements.plot.append("g")
                        .attr("clip-path", "url(#clipStitch)")
                        .attr("id", function() {
                            return "scatter-" + i;
                        })
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                        .selectAll("dot")
                        .data(d.values).enter()
                            .append("circle")
                            .attr("class", "dot")
                            .filter(function(d) {
                                return d.x !== null && d.x !== NaN && d.y !== null && d.y !== NaN;
                            })
                            .attr("r", 4)
                            .attr("cx", function (d) {
                                return scale.xScale(d.x);
                            })
                            .attr("cy", function (d) {
                                return scale.yScale(d.y);
                            })
                            .style("stroke", "white")
                            .style("stroke-width", "1px")
                            .style("opacity", 1)
                            .style("fill", function () {
                                return d.color = color(d.key);
                            });

                    // Add the Legend
                    elements.legend = elements.plot.append("g");

                    elements.legend.append("rect")
                        .attr("x", width - margin.right - margin.right)
                        .attr("y", (margin.top + 20) + i * 25)
                        .attr("class", "legend")
                        .style("fill", function () {
                            return d.color = color(d.key);
                        })
                        .attr("height", "8px")
                        .attr("width", "8px");

                    elements.legend.append("text")
                        .attr("x", width - margin.right - margin.right + 15)
                        .attr("y", (margin.top + 28) + i * 25)
                        .attr("class", "legend")
                        .style("fill", function () {
                            return d.color = color(d.key);
                        })
                        .style("font-size", "12px")
                        .style("font-weight", "bold")
                        .text(d.key);

            });

            // Now everything is added, call zoom
            elements.svg.call(zoomObj.zoom);

            // Add responsive elements
            // Essentially when the plot gets resized it will look to the
            // width and scale the plot according to newly updated width.
            // The css file has min- and max-width's incase the resizing gets too small,
            // the plot will not scale below these dimensions.
            // Solution courtesy of: https://stackoverflow.com/a/26077110
            $.event.special.widthChanged = {
                remove: function() {
                    $(this).children('iframe.width-changed').remove();
                },
                add: function () {
                    let elm = $(this);
                    let iframe = elm.children('iframe.width-changed');
                    if (!iframe.length) {
                        iframe = $('<iframe/>').addClass('width-changed').prependTo(this);
                    }
                    let oldWidth = elm.width();
                    function elmResized() {
                        let width = elm.width();
                        if (oldWidth != width) {
                            elm.trigger('widthChanged', [width, oldWidth]);
                            oldWidth = width;
                        }
                    }

                    let timer = 0;
                    let ielm = iframe[0];
                    (ielm.contentWindow || ielm).onresize = function() {
                        clearTimeout(timer);
                        timer = setTimeout(elmResized, 20);
                    };
                }
            }

            let chartStitch = $(".stitch-chart");
            let aspectRatio = chartStitch.width() / chartStitch.height()
            let container = chartStitch.parent();

            $("#stitch-plot").on("widthChanged", function() {
                let targetWidth = container.width();
                chartStitch.attr("width", targetWidth);
                chartStitch.attr("height", Math.round(targetWidth / aspectRatio));
            });

            // Edit toggle to default zoom
            my.toggleEdit(toggleChoice);
    };

    // BRUSH FEATURES
    my.newBrush = function () {
        // console.log("new brush");
        var brush = d3.brushX()
            .extent([[0, 0], [dim.width, dim.height]])
            .on("start", brushstart)
            .on("brush", brushed)
            .on("end", brushend);

            brushObj.brushes.push({id: brushObj.brushes.length, brush: brush});

            function brushstart() {
                // Brush start here
            };

        function brushed() {
            let rawSelection = d3.event.selection;
            let convertedSelection = d3.event.selection.map(i => scale.brushXScale.invert(i));

            brushObj.brushSelections[this.id] = {
                raw: rawSelection,
                converted: convertedSelection
            };

            // console.log("Selections are: ", brushObj.brushSelections);
            // console.log("ID:", this.id);
        }

        function brushend() {
            // Figure out if our latest brush has a selection
            var lastBrushID = brushObj.brushes[brushObj.brushes.length - 1].id;
            var lastBrush = document.getElementById('brush-' + lastBrushID);
            var selection = d3.brushSelection(lastBrush);

            // If it does, that means we need another one
            if (brushObj.brushes.length < brushObj.brushCount && selection && selection[0] !== selection[1]) {
                my.newBrush();
            }

            // Always draw brushes
            my.drawBrushes();
        }
    }

    my.drawBrushes = function () {

        var brushSelection = brushObj.brushGroup
            .selectAll('.brush')
            .data(brushObj.brushes, function (d){return d.id});

            // Set up new brushes
        brushSelection.enter()
            .insert("g", '.brush')
            .attr('class', 'brush')
            .attr('id', function(brush){ return "brush-" + brush.id; })
            .each(function(brushItem) {
                // call the brush
                brushItem.brush(d3.select(this));
            });

        brushSelection
            .each(function (brushItem){
            d3.select(this)
                .attr('class', 'brush')
                .selectAll('.overlay')
                .style('pointer-events', function() {
                var brush = brushItem.brush;
                if (brushItem.id === brushObj.brushes.length-1 && brush !== undefined) {
                    return 'all';
                } else {
                    return 'none';
                }
                });
            })

        brushSelection.exit()
            .remove();
    }

    my.removeBrushes = function() {
        brushObj.brushGroup.selectAll('.brush').remove();

        brushObj.brushes = [];
        brushObj.brushSelections = {};
        
        my.newBrush();
        my.drawBrushes();
        my.toggleEdit(toggleChoice);
    }

    // ZOOM FEATURES
    my.zoomed = function () {
        // Update Scales
        let new_yScale = d3.event.transform.rescaleY(scale.yScale);
        let new_xScale = d3.event.transform.rescaleX(scale.xScale);

        // Update brushScale to reflect new zoomed scale
        scale.brushXScale = new_xScale;

        // If there are brushes, re-adjust selections according to new scale
        if(Object.keys(brushObj.brushSelections).length > 0) {
            
            brushObj.brushSelections = _.mapValues(brushObj.brushSelections, function(el) {
                return {
                    raw: el.raw,
                    converted: el.raw.map(i => scale.brushXScale.invert(i))
                }
            });
        }
        
        // re-scale axes and gridlines during zoom
        elements.axes.select(".axis--y").transition()
            .duration(50)
            .call(axesObj.yAxis.scale(new_yScale));

        elements.axes.select(".axis--x").transition()
            .duration(50)
            .call(axesObj.xAxis.scale(new_xScale));

        elements.axes.select(".gridline--y").transition()
            .duration(50)
            .call(axesObj.yGridline.scale(new_yScale));
        
        elements.axes.select(".gridline--x").transition()
            .duration(50)
            .call(axesObj.xGridline.scale(new_xScale));
        
        // re-draw scatter plot;
        elements.plot.selectAll("circle")
            .attr("cy", function (d) {
                return new_yScale(d.y);
            })
            .attr("cx", function (d) {
                return new_xScale(d.x);
            });

        // re-draw line
        plotLine = d3.line()
            .x(function (d) {
                return new_xScale(d.x);
            })
            .y(function (d) {
                return new_yScale(d.y);
            });

        elements.plot.selectAll(".pointlines")
            .attr("d", plotLine);

        // Re-draw error
        elements.errorlines.selectAll('.error')
            .attr('x1', function (d) {
                return new_xScale(d.x);
            })
            .attr('x2', function (d) {
                return new_xScale(d.x);
            })
            .attr('y1', function (d) {
                return new_yScale(d.y + d.e);
            })
            .attr('y2', function (d) {
                if(d.y - d.e < 0 && scale.yScaleType === "Log(Y)") {
                    return new_yScale(d.y)
                } else {
                    return new_yScale(d.y - d.e);
                }
            });
        
        // re-draw error tick top
        elements.errorlines.selectAll(".error-tick-top")
            .attr('x1', function (d) {
                return new_xScale(d.x) - 4;
            })
            .attr('x2', function (d) {
                return new_xScale(d.x) + 4;
            })
            .attr('y1', function (d) {
                return new_yScale(d.y + d.e);
            })
            .attr('y2', function (d) {
                return new_yScale(d.y + d.e);
            });

        // re-draw error tick bottom
        elements.errorlines.selectAll(".error-tick-bottom")
            .filter( function(d) {
                if(scale.yScaleType === "Log(Y)") {
                    return d.y - d.e > 0;
                } else {
                    return true;
                }
            })
            .attr('x1', function (d) {
                return new_xScale(d.x) - 4;
            })
            .attr('x2', function (d) {
                return new_xScale(d.x) + 4;
            })
            .attr('y1', function (d) {
                return new_yScale(d.y - d.e);
            })
            .attr('y2', function (d) {
                return new_yScale(d.y - d.e);
            });
    }

    my.resetPlot = function() {

          elements.svg.transition()
              .duration(750)
            .call(zoomObj.zoom.transform, d3.zoomIdentity);
    }

    /* Brush Validation Rules:
        1) Must have drawn brushes, so no stitching with no brushes...obviously. validateBrushes handles this.
        2) Must have n-1 brushes (so 3 lines needs 2 brushes) - validateBrushes handles this
        2) Must have 2 lines per brush (no selecting 3 lines or one) - validateSelections handles this
        3) Brushes cannot exclude a curve - validateSelections handles this,
            e.g. If three curves {Line1, Line2, Line3} then:

            GOOD: Brush1 {Line1, Line2} & Brush2 {Line2, Line3}
            NOT: Brush1 {Line1, Line2} & Brush2 {Line1, Line2}
            Not: Brush1 {Line1, Line2} & Brush2 {Line1} - this violates rule 2 anyways.
    */

    // Function to check if there are selections available
    var validateBrushes = function() {
            // console.log(brushObj.brushSelections);
            // console.log(Object.keys(brushObj.brushSelections));
            let totalBrushes = Object.keys(brushObj.brushSelections).length;

            if(totalBrushes === 0) {
                console.log("No brushes to select data.");

                // Emit error message pop-up
                let errorMsg = "<strong>Warning!</strong> No brushes to select data. Draw brushes.";
                eventBus.$emit('error-message', errorMsg);

                return true;
            } else if (totalBrushes !== brushObj.brushCount) {
                console.log("There are " + (brushObj.brushCount + 1) + " lines. You must have (n-1) = " + brushObj.brushCount + " number of brushes.");

                // Emit error message pop-up
                let errorMsg = "<strong>Warning!</strong>" + " There are " + (brushObj.brushCount + 1) + " lines. You must have (n-1) = " + brushObj.brushCount + " number of brushes. Redraw brushes.";
                eventBus.$emit('error-message', errorMsg);

                return true;
            } else {
                return false;
            }
    }

    var getLineNames = function() {
        let tempNames = [];

        for(let i = 0, len = dataNest.length; i < len; i++) {
            tempNames.push( dataNest[i].key );
        }

        return tempNames;
    }

    var validateSelections = function(selected) {

        let lineNames = getLineNames();

        // First make sure only 2 lines and only 2 lines are selected per brush
        for( let i = 0, len = selected.length; i < len; i++ ) {
            let tempBrush = selected[i];
            if(tempBrush.length - 1 !== 2) {
                console.log("Make sure a brush selects 2 and only 2 lines.")

                // Emit error message pop-up
                let errorMsg = "<strong>Warning!</strong> Make sure a brush selects 2 and only 2 lines. Redraw brushes.";
                eventBus.$emit('error-message', errorMsg);

                return true;
            }
        }

        // Reduce keys to a non-nested array
        let keys = [];
        
        for ( let i = 0, len = selected.length; i < len; i++) {
            for ( let j = 0, len = selected[i].length - 1; j < len; j++) {
                
                // Check that each brush selects more than one point per curve
                // Leverberg Marquardt cannot fit arrays of length = 1
                if(selected[i][j][2].x.length < 2) {
                    console.log("Select more than 1 data point per curve.");
                    
                    // Emit error message pop-up
                    let errorMsg = "<strong>Warning!</strong> Select more than 1 data point per curve. Redraw brushes.";
                    eventBus.$emit('error-message', errorMsg);
                    
                    return true;
                }

                keys.push(selected[i][j][0]);
            }
        }

        // If none of the items in keys matches to lineNames,
        // set to true because not all lines have been selected in brushes
        for(let i = 0, len = lineNames.length; i < len; i++) {
            if(keys.indexOf(lineNames[i]) === -1) {
                console.log(lineNames[i] + " was not selected. Make sure each line is selected.");

                // Emit error message pop-up
                let errorMsg = "<strong>Warning!</strong> " + lineNames[i] + " was not selected. Make sure each line is selected. Redraw brushes.";
                eventBus.$emit('error-message', errorMsg);

                return true;
            }
        }

        return false;
    }

    var sortBrushes = function() {
        // The object will be turned to an order array,
        // because objects do not promise an exact order like arrays.

        var sorted = _.toPairs(_.cloneDeep(brushObj.brushSelections));

        sorted.sort(function(a,b) {
            return a[1].raw[0] - b[1].raw[0];
        })

        return sorted;
    }

    // re-format selected data array for interpolate function
    var formatData = function(data) {
        let formatted = [];

        for(let i = 0, len = data.length; i < len; i++) {
            let tempData = data[i].values;
            let tempName = data[i].key;

            let x = [], y = [], e = [];

            tempData.forEach(el => { 
                x.push(el.x);
                y.push(el.y);
                e.push(el.e);
            })

            formatted.push( [ tempName, {x:x, y:y, e:e}]);
        }

        // Sort curves form least to greatest

        formatted.sort(function(a,b) {
            let minA = _.min(a[1].x);
            let minB = _.min(b[1].x);

            return minA - minB;
        })

        return formatted;
    }

    // Function to identify how many lines are within a brush selection
    var selectData = function() {
    
        // If there are no brush selections, don't bother matching the data
        if (validateBrushes()) return [];

        let matches = [];
        let allData = formatData(dataNest); // An array of all data sorted left to right by x axis values
        // console.log("All data:", allData);

        // First sort brushes so that selections are made left to right
        let sortedBrushes = sortBrushes(); // an array of sorted brush selections
        // console.log("Sorted Brushes:", sortedBrushes);

        for ( let i = 0, len = sortedBrushes.length; i < len; i++) {
            let start = sortedBrushes[i][1].converted[0];
            let end = sortedBrushes[i][1].converted[1];

            let tempSelection = [];
            // let tempLeft = {};
            // let tempRight = {};

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

    var addStitch = function(line) {

        // First repackage data to an array of objects per points for d3 to work with
        let newData = [];

        for(let i = 0, len = line.x.length; i < len; i++) {
            
            newData.push({
                x: line.x[i],
                y: line.y[i],
                e: line.e[i]
            });
        }

        // If first time plotting stitch line, draw path with animation from start to end
        if(d3.select("#stitch-line").empty()) {
            
            elements.stitchy = elements.plot.append("g")
                .attr("id", "stitch-line")    
                .append('path')
                    .attr("clip-path", "url(#clipStitch)")
                    .attr("transform", "translate(" + 80 + "," + 80 + ")")
                    .datum(newData)
                    .attr("class", "pointlines")
                    .attr("d", plotLine)
                    .style("fill", "none")
                    .style("stroke", "red")
                    .style("stroke-width", "2px");

            var totalLength = elements.stitchy.node().getTotalLength();
            
            elements.stitchy.attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                        .duration(5000)
                        .ease(d3.easePolyInOut)
                        .attr("stroke-dashoffset", 0)
                        .on('end', changeStyle); // Change to dash line one finished drawing path
                        
            function changeStyle() {
                elements.stitchy.attr("stroke-dasharray", "4,4");
            }

        } else {
            // if updating current stitched line, simply transition to new path, no animate start to end
            elements.stitchy.datum(newData)
                .transition().duration(1500)
                .attr("d", plotLine);
        }
    }

    my.stitchData = function() {
        let selectedData = selectData();
        // console.log("Selected:", selectedData);

        //Run tests to check if appropriate brush selections are made
        if( selectedData.length === 0 ) {
            console.log("Re-draw brushes.");            
        } else if (validateSelections(selectedData)) {
            console.log("Re-draw brushes.");
        } else {
            console.log("Selected Data: ", selectedData);
            
            // Now interpolate data
            let line = interpolate.linear(selectedData);

            // Put the line onto the plot
            addStitch(line);
        }

    }

    // Return Module object for public use
    return my;
}(d3, _, $, eventBus));

// Export stitch module for use in PlotStitch.vue
export default stitch;