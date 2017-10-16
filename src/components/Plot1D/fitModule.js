import * as d3 from 'd3';
import _ from 'lodash';
import $ from 'jquery';

// The eventBus serves as the means to communicating between components.
// Here it's being used in modulefit to communicate to App.vue for error messages
import { eventBus } from '../../assets/javascript/eventBus.js';

import fd from '../../assets/javascript/fitData.js';

var fit1D = (function(d3, _, $, eventBus) {
    /******* Private Global Variables for fit Module **************/

        // Object for plot elements
        var elements = {
            svg: undefined,
            plot: undefined,
            axis: undefined,
            legend: undefined,
            errorlines: undefined,
            slider: undefined,
            fitline: undefined,
            tooltip: undefined
        };

        // Object for plot scale functions
        var scales = {
            xScale: undefined,
            yScale: undefined,
            yScaleType: undefined,
            xScale2: undefined,
        };

        // Object for dimensions
        var dim = {
            width: undefined,
            height: undefined,
            height2: undefined,
            viewbox: undefined
        };

        var margin = {};
        var margin2 = {};

        // Object for axis generators
        var axesObj = {
            xAxis: undefined,
            xAxis2: undefined,
            yAxis: undefined,
            xGridline: undefined,
            yGridline: undefined,
            yTitle: 'Y',
            xTitle: 'X'
        }

        // Object for brush elements
        var brushObj = {
            brush: undefined,
            brushSelection: [],
            brushFile: undefined,
            brushFit: undefined,
            brushTransformation: undefined
        };

        var selLimits = {
            xMin: null,
            xMax: null
        }

        // Object for Zoom behaviors
        var zoomObj = {
            zoom: undefined,
            zoomed: undefined
        }

        // Function for line generator
        var plotLine = undefined;

        // Object to store relevant plot data
        var plotData = undefined;
        var dataToFit = undefined;
        var fitData = undefined;
        var dataNest = undefined;
        var coefficients = undefined;
        var fitError = undefined;
        var fitResults = undefined;

        // Array to store a fited line's data
        var fitLineData = [];
        var fitEquation = undefined;
        var plotParameters = undefined;

        // Generator for color
        var color = undefined;
        var prevKeys = [];
        var isFit = undefined;
        var prevFit = null;
        var prevTransform = undefined;

    /******* End of Global for fit Module **************/

    // Module object
    var my = {};
    
    /*********** Plotting Function  ***************/

    my.initDimensions = function(isfit) {
        let viewHeight;
        
        // Pull plot's parent container width, this will be used to scale the plot responsively
        var containerWidth = document.getElementById("plot-1D").offsetWidth;

        if(isfit) {
            margin = {
                top: 50,
                right: 50,
                bottom: 100, // adjusts margin for slider
                left: 75
            };
            
            // View Height is calculated on a 16:9 aspect ratio
            // This is to properly adjust the plot to the container width
            // This is mostly used when the user adjusts the browser 
            // from small (mobile) to large (desktop) window sizes.
            viewHeight = containerWidth / (16/9);
            dim.height = viewHeight - margin.top - margin.bottom;
        } else {
            margin = {
                top: 50,
                right: 50,
                bottom: 50,
                left: 75
            };

            viewHeight = containerWidth / (16/9);
            dim.height = viewHeight - margin.top - margin.bottom;
        }

        dim.width = containerWidth - margin.left - margin.right;

        // Set viewbox for to enable responsive scaling for svg upon window resize
        dim.viewbox = "0 0 " + containerWidth + " " + viewHeight;
    }

    my.initScales = function() {
                
        axesObj.xTitle = plotParameters.fitConfiguration.xTransformation; //xTitle according to label
        axesObj.yTitle = plotParameters.fitConfiguration.yTransformation; //yTitle according to label
        
        // Set scales
        scales.xScale = plotParameters.scales.xScale;
        scales.xScale.range([0,dim.width]);
        scales.xScale.domain(d3.extent(plotData, function (d) {
            return d.x;
        }));
        
        scales.yScale = plotParameters.scales.yScale;
        scales.yScaleType = plotParameters.scales.yScaleType;
        scales.yScale.range([dim.height, 0]);
        scales.yScale.domain(d3.extent(plotData, function(d) {
            return d.y;
        }));

        // Set Axes
        axesObj.xAxis = d3.axisBottom(scales.xScale).ticks(10);
        axesObj.yAxis = d3.axisLeft(scales.yScale).ticks(10);
        axesObj.xGridline = d3.axisBottom(scales.xScale).ticks(10).tickSize(-dim.height).tickFormat("");
        axesObj.yGridline = d3.axisLeft(scales.yScale).ticks(10).tickSize(-dim.width).tickFormat("");

        // Set Color Scale
        // color domain is set in order for filenames to have
        // assigned colors. If this wasn't set and a filename
        // was unselected from the list, the plot would re-assign
        // color values to the plots causing confusion at first glance
        // reference: https://stackoverflow.com/questions/20590396/d3-scale-category10-not-behaving-as-expected
        color = d3.scaleOrdinal(d3.schemeCategory20)
            .domain(plotParameters.colorDomain);
    }

    my.initSlider = function() {
        margin2 = {
            top: 30,
            right: 50,
            bottom: 50,
            left: 75
        };

        dim.height2 = 25;

        // Set scales
        scales.xScale2 = plotParameters.scales.xScale;

        scales.xScale2.range([0,dim.width]);
        scales.xScale2.domain(d3.extent(plotData, function (d) {
            return d.x;
        }));

        axesObj.xAxis2 = d3.axisBottom(scales.xScale2);

        elements.slider = elements.svg.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + margin2.left + "," + (dim.height + margin2.top + margin2.bottom) + ")");

        brushObj.brush = d3.brushX()
            .extent([
                [0, 0],
                [dim.width, dim.height2]
            ]);
            // .on("brush", my.brushed);

        // append scatter plot to brush chart area
        elements.slider.append("g").attr("id", "slider-lines")

        elements.slider.append("g")
            .attr("class", "brush")
        
        elements.slider.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + dim.height2 + ")");
    }

    my.updateSlider = function() {
        
        dataToFit = plotData.filter( (d) => d.name === plotParameters.fileToFit);

        fitResults = fd.fitData(dataToFit, plotParameters.fitConfiguration.equation, plotParameters.fitSettings);
        coefficients = fitResults.coefficients;
        fitData = fitResults.fittedData;
        fitError = fitResults.error;

        scales.xScale2.domain(d3.extent(plotData, function(d) { return d.x; })).nice();
        let new_xScale2 = scales.xScale2.copy();

        // update brush x scale axis
        axesObj.xAxis2.scale(new_xScale2);
        
        // visually reflect the newly updated x axis
        elements.slider.select('.axis--x').transition().duration(750).call(axesObj.xAxis2);

        let selectSlider = elements.slider.select("#slider-lines").selectAll("line").data(dataToFit);

        selectSlider.transition().duration(750)
            .attr("x1", function(d) { return new_xScale2(d.x); })
            .attr("y1", dim.height2)
            .attr("x2", function(d) { return new_xScale2(d.x); })
            .attr("y2", 0);
        
        // enter new brush lines
        selectSlider.enter()
            .append("line")
            .attr('class', 'dotslider')
            .attr("x1", function(d) { return new_xScale2(d.x); })
            .attr("y1", dim.height2)
            .attr("x2", function(d) { return new_xScale2(d.x); })
            .attr("y2", 0)
            .style("stroke", "slategray");

        // remove any old brush lines
        selectSlider.exit().remove();

        // Call brush
        brushObj.brush.on("brush", my.brushed);

        // set initial brushSelection
        if(brushObj.brushSelection.length === 0 || !(plotParameters.fileToFit === brushObj.brushFile) || !(brushObj.brushTransformation === plotParameters.fitConfiguration.xTransformation)) {

            let xExtent = d3.extent(dataToFit, function(d) { return d.x;});
            
            brushObj.brushSelection[0] = new_xScale2(xExtent[0]);
            brushObj.brushSelection[1] = new_xScale2(xExtent[1]);
            brushObj.brushFit = plotParameters.fitConfiguration.fit;
            brushObj.brushFile = plotParameters.fileToFit;
            brushObj.brushTransformation = plotParameters.fitConfiguration.xTransformation;

        } else if (!(brushObj.brushFit === plotParameters.fitConfiguration.fit)) { // if same file to fit, but new fit transformation, change brush selections

            let xExtent = d3.extent(dataToFit, function(d) { return d.x;});
            
            brushObj.brushSelection[0] = new_xScale2(xExtent[0]);
            brushObj.brushSelection[1] = new_xScale2(xExtent[1]);
            brushObj.brushFit = plotParameters.fitConfiguration.fit;   
        } else { // if same file to fit after update and same fit transformation, simply update brush selection to current selection
            brushObj.brushSelection[0] = new_xScale2(selLimits.xMin);
            brushObj.brushSelection[1] = new_xScale2(selLimits.xMax);
        }

        elements.slider.select('.brush')
            .call(brushObj.brush)
            .call(brushObj.brush.move, brushObj.brushSelection); 
        // brush.move allows you to set the current selection for the brush element
        // this will dynamically update according to the last selection made.
        // This is to allow for persistent selections upon the plot being re-drawn.
    }

    my.initFitLine = function() {
        // Add fitted line
        elements.plot.append("g")
            .attr("id", "fit-line")
            .append("path")
            .attr("clip-path", "url(#clip)")
            .attr("class", "fitted-line");
    }

    my.updateFitLine = function() {
        
        // update fitted line
        // Re-draw plot lines with new data            
        let selectFitLine = elements.plot.select("#fit-line").select("path").data([fitData]);

        selectFitLine.transition().duration(750)
            .attr("d", plotLine)
            .style("fill", "none")
            .style("stroke", color(plotParameters.fileToFit));

        // Update Fit Table
        var minX = d3.min(dataToFit, function(d) { return d.x });
        var maxX = d3.max(dataToFit, function(d) { return d.x });

        d3.select("td#fit-file").html("<b>File: </b>" + plotParameters.fileToFit);
        d3.select("td#fit-type").html("<b>Fit Type:</b> " + plotParameters.fitConfiguration.fit);
        d3.select("td#fit-points").html("<b>No. Points:</b> " + dataToFit.length);
        d3.select("td#fit-range").html("<b>Fit Range:</b> (" + minX.toExponential(2) + ", " + maxX.toExponential(2) + ")");
        d3.select("td#fit-error").html("<b>Fit Error:</b> " + fitError.toExponential(2));
        
        d3.select("td#fit-coefficients").html(function() {
            let coeffString = "<ul>";
            for( let key in coefficients) {
                
                if(plotParameters.fitConfiguration.fit.toLowerCase().includes('guinier')) {

                    if(key === 'I0') {
                        let I0 = Math.exp(coefficients[key]);
                    
                        coeffString += "<li>Real " + key + " = " + I0 + "</li>";
                        continue;
                    }

                    if(key === 'Rg') {
                        let RgX = coefficients[key] * Math.sqrt(scales.xScale.invert(brushObj.brushSelection[1]));
                        coeffString += "<li>" + key + " = " + coefficients[key].toFixed(3) + " | Rg * x_max = " + RgX.toFixed(3) + "</li>";
                        continue;
                    }
                }

                coeffString += "<li>" + key + " = " + coefficients[key].toFixed(3) + "</li>";
            }
            coeffString += "</ul>";
            return coeffString;
        });

        d3.select("li#fit-damping").html("<b>Damping: </b>" + plotParameters.fitSettings.damping);
        d3.select("li#fit-iterations").html("<b>No. Iterations: </b>" + plotParameters.fitSettings.maxIterations);
        d3.select("li#fit-tolerance").html("<b>Error Tolerance: </b>" + plotParameters.fitSettings.errorTolerance);
        d3.select("li#fit-gradient").html("<b>Gradient Difference: </b>" + plotParameters.fitSettings.gradientDifference);

        d3.select("#fit-note").html(plotParameters.fitConfiguration.note);
    }

    my.plotData = function(parameters, vm) {
        // Set isFit to check if a file is selected to fit
        plotParameters = _.cloneDeep(parameters);
        isFit = plotParameters.fileToFit !== null && plotParameters.fitConfiguration.fit !== 'None';

        // If plot is already present, simply update with the new set of data
        if(!d3.select(".chart-1D").empty() && isFit === prevFit) {
            
            // Update titles according to new transformations
            axesObj.xTitle = plotParameters.fitConfiguration.xTransformation;
            axesObj.yTitle = plotParameters.fitConfiguration.yTransformation;

            my.update(parameters.data);

            return;
        } else { // New fit is being selected so tear down plot and re-do everything from scratch
            d3.select(".chart-1D").remove();
            d3.select("#tooltip-1D").remove();
            selLimits.xMin = null;
            selLimits.yMin = null;
            brushObj.brushSelection = [];
            brushObj.brushFile = undefined;
        }

        plotData = plotParameters.data; //regular data to plot
        // Filter any infinity values, null, or NaN before plotting, this will happen when transforming log data = 0
        plotData = plotData.filter((d) => Number.isFinite(d.y) && Number.isFinite(d.x));
       
        //Catch any empty data and throw an error
        if(plotData.length < 1) {
            console.log("No data! Error!");
            //Remove any elements previously plotted
            d3.select(".chart-1D").remove();
            d3.select("#tooltip-1D").remove();
            vm.isError = !vm.isError;
            
            if(my.checkError()) {
                let errorMsg = "<strong>Error!</strong> No data to plot...might be due to the fit transformation resulting in invalid values.";
                eventBus.$emit('error-message', errorMsg, 'danger');
            }

            return;
        } else {
            vm.isError = false;
        }

        // Set chart dimensions
        my.initDimensions(isFit);

        // Set scale elements
        my.initScales();

        //Add a Line Plot Function
        plotLine = d3.line()
            .defined(function(d) { 
                if(scales.yScaleType === 'Log(Y)') {
                    return d.y > 0;
                } else {
                    return d;
                }
            })
            .x(function (d) {
                return scales.xScale(d.x);
            })
            .y(function (d) {
                return scales.yScale(d.y);
            });

        // Add tool tip and hide it until invoked
        elements.tooltip = d3.select("#app-container").append("div")
            .attr("id", "tooltip-1D")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Add main chart area
        elements.svg = d3.select("#plot-1D").append("svg")
            .attr("viewBox", dim.viewbox)
            .attr("perserveAspectRatio","xMidYMid meet")
            .attr("class", "chart-1D")
            .attr("width", dim.width + margin.left + margin.right)
            .attr("height", dim.height + margin.top + margin.bottom);
        
        // Add clip path so points/line do not exceed plot boundaries
        elements.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", dim.width)
            .attr("height", dim.height);

        // Add plot area
        elements.svg.append("rect")
            .attr("class", "plotbg")
            .attr("width", dim.width)
            .attr("height", dim.height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add Axis and Gridline section
        elements.axis = elements.svg.append("g").attr("id", "axis-1D");

        // Add zoom window
        zoomObj.zoom = d3.zoom().on("zoom", my.zoomed);

        elements.svg.append('rect')
            .attr('class', 'zoom')
            .attr('width', dim.width)
            .attr('height', dim.height)
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        //Add Error-bars Section
        elements.errorlines = elements.svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        
        //Add Group to Plot Line/Points
        elements.plot = elements.svg.append("g")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr("class", "chart");
        
        /* CHECK ISFIT AND SETUP Slider DIMENSIONS, FIT DATA, & SCALES */
        if(isFit)   my.initSlider();
        /* END OF IS FIT SETUP*/

        // X Gridlines
        elements.axis.append("g")
            .attr("transform", "translate(" + margin.left + "," + (dim.height + margin.top) + ")")
            .attr("class", "gridline gridline--x");

        // Y Gridlines
        elements.axis.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "gridline gridline--y");

        // Add X Axis
        elements.axis.append("g")
            .attr("transform", "translate(" + margin.left + "," + (dim.height + margin.top) + ")")
            .attr("class", "axis axis--x");

        // Add Y Axis
        elements.axis.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "axis axis--y");
        
        // Add Y Axis Label
        elements.svg.append("g").append("foreignObject")
            .attr("height", 100)
            .attr("width", 200)
            .attr("transform", "translate(0," + (dim.height/2) + ") rotate(-90)")
            .attr("id", "yLabel")
            .html("`" + axesObj.yTitle + "`");

        // Add X Axis Label
        elements.svg.append("g").append("foreignObject")
            .attr("height", 100)
            .attr("width", 200)
            .attr("transform", "translate(" + ((dim.width+margin.left+margin.right)/2) + "," + (dim.height+margin.top*2.5) + ")")
            .attr("id", "xLabel")
            .html("`" + axesObj.xTitle + "`");

        // Add Chart Title
        elements.svg.append("g").append("foreignObject")
            .attr("height", 100)
            .attr("width", 200)
            .attr("transform", "translate(" + ((dim.width+margin.left+margin.right)/2) + ",10)")
            .attr("id", "plotTitle")
            .html("`" + axesObj.yTitle + "` vs `" + axesObj.xTitle + "`");

        // Call MathJax to make plot axis labels look pretty 
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, ["xLabel", "yLabel", "plotTitle"]]);

        // Add the Legend
        elements.legend = elements.plot.append("g").attr("id", "legend-1D");

        // If fit is select add elements for fitted line
        if(isFit)   my.initFitLine();

        // Set zoom on zoomWindow
        elements.svg.select(".zoom").call(zoomObj.zoom);

        // Add responsive elements
        // Essentially when the plot-1D gets resized it will look to the
        // width and scale the plot according to newly updated width.
        // The css file has min- and max-width's incase the resizing gets too small,
        // the plot will not scale below these dimensions.
        // Solution courtesy of: https://stackoverflow.com/a/26077110
        $.event.special.widthChanged = {
            remove: function() {
                $(this).children('iframe.width-changed').remove();
            },
            add: function () {
                var elm = $(this);
                var iframe = elm.children('iframe.width-changed');
                if (!iframe.length) {
                    iframe = $('<iframe/>').addClass('width-changed').prependTo(this);
                }
                var oldWidth = elm.width();
                function elmResized() {
                    var width = elm.width();
                    if (oldWidth != width) {
                        elm.trigger('widthChanged', [width, oldWidth]);
                        oldWidth = width;
                    }
                }

                var timer = 0;
                var ielm = iframe[0];
                (ielm.contentWindow || ielm).onresize = function() {
                    clearTimeout(timer);
                    timer = setTimeout(elmResized, 20);
                };
            }
        }

        var chart1D = $(".chart-1D");
        var aspectRatio = chart1D.width() / chart1D.height()
        var container = chart1D.parent();

        $("#plot-1D").on("widthChanged", function() {
            var targetWidth = container.width();
            chart1D.attr("width", targetWidth);
            chart1D.attr("height", Math.round(targetWidth / aspectRatio));
        });

        // Once elements are set call update to plot data
        prevFit = isFit;
        my.update(plotData);
    }

    /**************** Update Function *******************************/

    my.update = function(newData) {
        
            // Update Plot Data
            plotData = newData;
            plotData = plotData.filter((d) => Number.isFinite(d.y) && Number.isFinite(d.x));
    
            // Nest the entries by name
            dataNest = d3.nest()
                .key(function (d) {
                    return d.name;
                })
                .entries(plotData);
            
            // Add keys
            let newKeys = [];
            dataNest.forEach(el => {
                let keyIndex = newKeys.indexOf(el.key);
                
                if( keyIndex === -1) {
                    newKeys.push(el.key);
                }
            })
    
            // Adjust scale's domain whenver new data is added
            scales.xScale.domain(d3.extent(plotData, function(d) { return d.x; })).nice();
            scales.yScale.domain(d3.extent(plotData, function(d) { return d.y; })).nice();

            // Adjust brush scale if a fit is selected
            if( isFit )  my.updateSlider();
    
            // Rescale to zoom's scale
            let t = d3.zoomTransform( elements.svg.select('.zoom').node());
            let new_yScale = t.rescaleY(scales.yScale); 
            let new_xScale = t.rescaleX(scales.xScale);
    
            // Adjust plotline generator
            plotLine = d3.line()
                .defined(function(d) { 
                    if(scales.yScaleType === 'Log(Y)') {
                        return d.y > 0;
                    } else {
                        return d;
                    }
                })
                .x(function(d) {
                    return new_xScale(d.x);
                })
                .y(function(d) {
                    return new_yScale(d.y);
                });
            
            // Adjust axis and gridline labels
            axesObj.yAxis.scale(new_yScale);
            axesObj.xAxis.scale(new_xScale);
            axesObj.yGridline.scale(new_yScale);
            axesObj.xGridline.scale(new_xScale);
            
            // Transition axis and gridlines labels accordingly
            elements.axis.transition().duration(750).select('.axis--y').call(axesObj.yAxis);
            elements.axis.transition().duration(750).select('.axis--x').call(axesObj.xAxis);
            elements.axis.transition().duration(750).select('.gridline--y').call(axesObj.yGridline);
            elements.axis.transition().duration(750).select('.gridline--x').call(axesObj.xGridline);
    
            // Add and update data
            dataNest.forEach(function (d, i) {
                
                // Add new elements if nothing exists
                if (d3.select("#line-1D-"+d.key).empty()) {
                    
                    // Add line plot
                    elements.plot.append("g").attr("id", "line-1D-" + d.key)
                    .append("g")
                    .attr("clip-path", "url(#clip)")
                    .append("path")
                        .data([d.values])
                        .attr("class", "pointlines")
                        .attr("d", plotLine)
                        .style("fill", "none")
                        .style("stroke", function () {
                            return d.color = color(d.key);
                        });;
                    
                    // Add error lines
                    elements.errorlines.append("g").attr("id", "error-1D-" + d.key)
                    .append("g")
                    .attr("clip-path", "url(#clip)")
                        .selectAll(".error-1D")
                        .data(d.values)
                        .enter()
                        .append('line')
                            .attr('class', 'error error-1D')
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
                                if(d.y - d.e < 0 && scales.yScaleType === "Log(Y)") {
                                    return new_yScale(d.y)
                                } else {
                                    return new_yScale(d.y - d.e);
                                }
                            })
                            .style("stroke", function () {
                                return d.color = color(d.key);
                            });
                    
                    // Add error tick top
                    elements.errorlines.append("g").attr("id", "error-1D-top-" + d.key)
                    .append("g")
                    .attr("clip-path", "url(#clip)")
                        .selectAll(".error-1D-tick-top")
                        .data(d.values)
                        .enter()
                        .append('line')
                            .attr('class', 'error-1D-tick-top')
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
                            })
                            .style("stroke", function () {
                                return d.color = color(d.key);
                            });
    
                    // Add error tick bottom
                    elements.errorlines.append("g").attr("id", "error-1D-bottom-" + d.key)
                    .append("g")
                    .attr("clip-path", "url(#clip)")
                        .selectAll(".error-1D-tick-bottom")
                        .data(d.values)
                        .enter()
                        .append('line')
                            .attr('class', 'error-1D-tick-bottom')
                            .filter( function(d) {
                                if(scales.yScaleType === "Log(Y)") {
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
                            })
                            .style("stroke", function () {
                                return d.color = color(d.key);
                            });
    
                    // Add Scatter plot
                    elements.plot.append("g").attr("id", "scatter-1D-" + d.key)
                    .append("g")
                    .attr("clip-path", "url(#clip)")
                    .selectAll(".dot")
                    .data(d.values)
                        .enter().append("circle")
                        .attr("class", "dot")
                            .filter(function(d) {
                                return d.x !== null && d.x !== NaN && d.y !== null && d.y !== NaN;
                            })
                            .attr("r", 4)
                            .attr("cx", function (d) {
                                return new_xScale(d.x);
                            })
                            .attr("cy", function (d) {
                                return new_yScale(d.y);
                            })
                            .style("stroke", "white")
                            .style("stroke-width", "1px")
                            .style("opacity", 1)
                            .style("fill", function () {
                                return d.color = color(d.key);
                            })
                            .on("mouseover", function (d) {
                                
                                elements.tooltip.transition()
                                    .duration(200)
                                    .style("opacity", 1);
    
                                elements.tooltip.html("Name: " + d.name + "<br/>" + "X: " + d.x.toFixed(6) + "<br/>" + "Y: " + d.y.toFixed(6) + "<br/>" + "Error: " + d.e.toFixed(6))
                                    .style("top", (d3.event.pageY - 40) + "px")
                                    .style("left", (d3.event.pageX + 20) + "px");
                            })
                            .on("mouseout", function (d) {
    
                                elements.tooltip.transition()
                                    .duration(500)
                                    .style("opacity", 0);
                            });
                            
                } else {
                    
                    // Re-draw plot lines with new data
                    let lineSelect = elements.plot.select("#line-1D-"+d.key).select("path").data([d.values]);
                    
                    lineSelect.transition().duration(750)
                        .attr("d", plotLine);
    
                    // Re-draw Error Lines
                    let errorSelect = elements.errorlines.select("#error-1D-"+d.key).selectAll("line").data(d.values);
                    
                    errorSelect.transition().duration(750)
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
                            if(d.y - d.e < 0 && scales.yScaleType === "Log(Y)") {
                                return new_yScale(d.y)
                            } else {
                                return new_yScale(d.y - d.e);
                            }
                        });
                    
                    // Enter new error Lines
                    errorSelect.enter()
                        .append('line')
                            .attr('class', 'error-1D')
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
                                if(d.y - d.e < 0 && scales.yScaleType === "Log(Y)") {
                                    return new_yScale(d.y)
                                } else {
                                    return new_yScale(d.y - d.e);
                                }
                            })
                            .style("stroke", function () {
                                return d.color = color(d.key);
                            });
    
                    // Remove old error lines
                    errorSelect.exit().remove();
    
                    // Re-draw Error Top
                    let errorTopSelect = elements.errorlines.select("#error-1D-top-"+d.key).selectAll("line").data(d.values);
                    
                    errorTopSelect.transition().duration(750)
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
                    
                    // Enter new error tops
                    errorTopSelect.enter()
                        .append('line')
                        .attr('class', 'error-1D-tick-top')
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
                        })
                        .style("stroke", function () {
                            return d.color = color(d.key);
                        });
    
                    // Remove old error tops
                    errorTopSelect.exit().remove();
    
                    // Re-draw Error Bottom
                    let errorBottomSelect = elements.errorlines.select("#error-1D-bottom-"+d.key).selectAll("line").data(d.values);
                    
                    errorBottomSelect.transition().duration(750)
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
                    
                    // Enter new error bottoms
                    errorTopSelect.enter()
                        .append('line')
                            .attr('class', 'error-1D-tick-bottom')
                            .filter( function(d) {
                                if(scales.yScaleType === "Log(Y)") {
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
                            })
                            .style("stroke", function () {
                                return d.color = color(d.key);
                            });
    
                    // Remove old error bottoms
                    errorBottomSelect.exit().remove();
    
                    // Update all circles
                    let scatterSelect = elements.plot.select("#scatter-1D-"+d.key).selectAll("circle").data(d.values);
                    
                    // Re-position points
                    scatterSelect.transition().duration(750)
                        .attr("cx", function(d) {
                            return new_xScale(d.x);
                        })
                        .attr("cy", function(d) {
                            return new_yScale(d.y);
                        });
    
                    // Enter new points
                    scatterSelect.enter()
                        .append("circle")
                        .attr("class", "dot")
                        .filter(function(d) {
                            return d.x !== null && d.x !== NaN && d.y !== null && d.y !== NaN;
                        })
                        .attr("cx", function(d) {
                            return new_xScale(d.x);
                        })
                        .attr("cy", function(d) {
                            return new_yScale(d.y);
                        })
                        .attr("r", 5)
                        .attr("stroke", "white")
                        .attr("stroke-width", "2px")
                        .style("fill", function() {
                            return d.color = color(d.key);
                        })
                        .on("mouseover", function (d) {
                            
                            elements.tooltip.transition()
                                .duration(200)
                                .style("opacity", 1);
    
                            elements.tooltip.html("Name: " + d.name + "<br/>" + "X: " + d.x.toFixed(6) + "<br/>" + "Y: " + d.y.toFixed(6) + "<br/>" + "Error: " + d.e.toFixed(6) + "<br/><br/><b>Note:</b> Click point to <em>delete</em> it.")
                                .style("top", (d3.event.pageY - 40) + "px")
                                .style("left", (d3.event.pageX + 20) + "px");
                        })
                        .on("mouseout", function (d) {
    
                            elements.tooltip.transition()
                                .duration(500)
                                .style("opacity", 0);
                        })
                        .on("click", function(d,i) {
                            removePoint(i, d.name);
                        });
    
                    // Remove old
                    scatterSelect.exit().remove()
                    
                    // If fit line is part of the plot, re-draw it too
                    if(!elements.plot.select("#fit-line").empty()) {
                        
                            elements.plot.select("#fit-line").select("path")
                                .transition().duration(750)
                                .attr("d", plotLine);
                            
                    }
                        
                }
            });

            /******* UPDATING LEGEND **********/
            my.updateLegend();
            /******* End LEGEND  **************/

            // Updated axis according to any new transformations
            // Add X Axis Label
            elements.svg.select("#xLabel").html("`" + axesObj.xTitle + "`");
            elements.svg.select("#yLabel").html("`" + axesObj.yTitle + "`");
            elements.svg.select("#plotTitle").html("`" + axesObj.yTitle + "` vs `" + axesObj.xTitle + "`");

            // Call MathJax to make plot axis labels look pretty 
            console.log("CALLING MATHJAX");
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, ["xLabel", "yLabel", "plotTitle"]]);

            // if a fit is selected add/update data
            if (isFit)  my.updateFitLine();
    
            let delKeys = [];
    
            for (let i = 0, len = prevKeys.length; i < len; i++) {
                let match = newKeys.indexOf( prevKeys[i] );
    
                if ( match === -1) {
                    delKeys.push( prevKeys[i] );
                }
            }
    
            // Remove any lines not in the dataNest
            delKeys.forEach(k => {
                d3.select("#scatter-1D-" + k).remove();
                d3.select("#line-1D-" + k).remove();
                d3.select("#error-1D-" + k).remove();
                d3.select("#error-1D-top-" + k).remove();
                d3.select("#error-1D-bottom-" + k).remove();
                d3.select("#legend-1D-" + k).remove();
            })
    
            // Update previous keys with current keys
            prevKeys = _.clone(newKeys);
        
    }

    my.updateLegend = function() {
        let keys = [];
        dataNest.forEach(el => { keys.push(el.key); });
        
        var legend = elements.svg.select("#legend-1D");
        
        var legendBox = legend.selectAll("rect").data(keys, function(d) { return d; });

        legendBox.exit().remove();
    
        legendBox.enter()
            .append("rect")
            .merge(legendBox)
            .attr("x", function(d,i) {
                let w = document.getElementById('plot-1D').offsetWidth;
                
                return w > 1400 ? dim.width - margin.right*4.5 + 'px' :
                        w > 1000 ? dim.width - margin.right*4 + 'px' : dim.width - margin.right*3 + 'px';
            })
            .attr("y", function(d,i) { 
                let w = document.getElementById('plot-1D').offsetWidth;

                return w > 1400 ? margin.top + i * 25 + 'px' :
                       w > 1000 ? margin.top/1.5 + i * 25 + 'px' : margin.top/2 + i * 20 + 'px';
            })
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function (d, i) {
                return color(d);
            })
            .attr("height", "8px")
            .attr("width", "8px");

        var legendText = legend.selectAll("text").data(keys, function(d) {return d;});

        legendText.exit().remove();
    
        legendText.enter()
            .append("text")
            .merge(legendText)
            .attr("x", function(d,i) {
                let w = document.getElementById('plot-1D').offsetWidth;

                return w > 1400 ? dim.width - margin.right*4.5 + 15 + 'px' :
                       w > 1000 ? dim.width - margin.right*4 + 15 + 'px' : dim.width - margin.right*3 + 15 + 'px';
            })
            .attr("y", function(d,i) { 
                let w = document.getElementById('plot-1D').offsetWidth;

                return w > 1400 ? (margin.top + 8) + i * 25 + 'px' :
                       w > 1000 ? (margin.top + 12)/1.5 + i * 25 + 'px' : (margin.top + 14)/2 + i * 20 + 'px';
            })
            .style("fill", function (d,i) {
                return color(d);
            })
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(function (d) {
                return d;
            });
    }

    // Create brush function redraw scatterplot with selection
    my.brushed = function() {
        // console.log("Calling brush...");
        brushObj.brushSelection = d3.event.selection;
        
        //scales.xScale2.domain(scales.xScale.domain());
        var e = d3.event.selection.map(scales.xScale2.invert, scales.xScale2);
        
        let selectedData = dataToFit.filter(function(d) {
            return e[0] <= d.x && d.x <= e[1];
        })

        // Update brush selections to the current selected data
        // This will be used to dynamically adjust brush location when new data is added
        selLimits.xMin = d3.min(selectedData, function(d) { return d.x; });
        selLimits.xMax = d3.max(selectedData, function(d) { return d.x; });

        if (brushObj.brushSelection !== null && selectedData.length > 1) {

            elements.slider.selectAll(".dotslider")
                .style("stroke", function (d) {
                    if(e[0] <= d.x && d.x <= e[1]) {
                        return d.color = color(d.name);
                    } else {
                        return "slategray";
                    }
                })
      
            fitResults = fd.fitData(selectedData, plotParameters.fitConfiguration.equation, plotParameters.fitSettings);
            coefficients = fitResults.coefficients;
            fitData = fitResults.fittedData;
            fitError = fitResults.error;

            // Re-assign updated fit equation and fitline function
            fitEquation = fitResults.fitEquation;

            if(fitData.length <= 0) {
                if(my.checkError()) {
                    let errorMsg = "<strong>Error!</strong> Fitted y-values < 0, thus no fit-line to display.";
                    eventBus.$emit('error-message', errorMsg, 'danger');
                }
            }
            // Emit coefficients to controls panel
            eventBus.$emit('update-coefficients', coefficients);

            // Add line plot
            elements.plot.select(".fitted-line").data([fitData])
                .attr("d", plotLine);

            // Revise fit results below chart
            d3.select("td#fit-file").html("<b>File: </b>" + plotParameters.fileToFit);
            d3.select("td#fit-type").html("<b>Fit Type:</b> " + plotParameters.fitConfiguration.fit);
            d3.select("td#fit-points").html("<b>No. Points:</b> " + selectedData.length);
            d3.select("td#fit-range").html("<b>Fit Range:</b> (" + e[0].toExponential(2) + ", " + e[1].toExponential(2) + ")");
            d3.select("td#fit-error").html("<b>Fit Error:</b> " + fitError.toExponential(2));
            
            d3.select("td#fit-coefficients").html(function() {
                let coeffString = "<ul>";
                for( let key in coefficients) {
                    
                    if(plotParameters.fitConfiguration.fit.toLowerCase().includes('guinier')) {

                        if(key === 'I0') {
                            let I0 = Math.exp(coefficients[key]);
                        
                            coeffString += "<li>Real " + key + " = " + I0 + "</li>";
                            continue;
                        }

                        if(key === 'Rg') {
                            let RgX = coefficients[key] * Math.sqrt(scales.xScale.invert(brushObj.brushSelection[1]));
                            coeffString += "<li>" + key + " = " + coefficients[key].toFixed(3) + " | Rg * x_max = " + RgX.toFixed(3) + "</li>";
                            continue;
                        }
                    }

                    coeffString += "<li>" + key + " = " + coefficients[key].toFixed(3) + "</li>";
                }
                coeffString += "</ul>";
                return coeffString;
            });
        } else {
            // Notify user that more data needs to be selected for the fit
            if(my.checkError()) {
                let errorMsg = "<strong>Error!</strong> Not enough data selected, please select 2 or more points. If plot is blank, no data is available for generating a fit line.";
                eventBus.$emit('error-message', errorMsg, 'danger');
            }
        }
    }

    my.zoomed = function() {
        // Update scales
        var new_yScale = d3.event.transform.rescaleY(scales.yScale);
        var new_xScale = d3.event.transform.rescaleX(scales.xScale);

        // re-scale axes and gridlines during zoom
        elements.axis.select(".axis--y").transition()
            .duration(50)
            .call(axesObj.yAxis.scale(new_yScale));

        elements.axis.select(".axis--x").transition()
            .duration(50)
            .call(axesObj.xAxis.scale(new_xScale));

        elements.axis.select(".gridline--y").transition()
            .duration(50)
            .call(axesObj.yGridline.scale(new_yScale));
        
        elements.axis.select(".gridline--x").transition()
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
            .defined(function(d) { 
                if(scales.yScaleType === 'Log(Y)') {
                    return d.y > 0;
                } else {
                    return d;
                }
            })
            .x(function (d) {
                return new_xScale(d.x);
            })
            .y(function (d) {
                return new_yScale(d.y);
            });

        elements.plot.selectAll(".pointlines")
            .attr("d", plotLine);

        if(isFit) {
            // Re-draw fitted line
            elements.plot.select(".fitted-line")
                .attr("d", plotLine);
        }

        // Re-draw error
        elements.errorlines.selectAll('.error-1D')
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
                if(d.y - d.e < 0 && scales.yScaleType === "Log(Y)") {
                    // console.log("Below zero! d.y = " + d.y + " | d.e = " + d.e + "| d.y - d.e = " + (d.y - d.e));
                    return new_yScale(d.y)
                } else {
                    return new_yScale(d.y - d.e);
                }
            });
        
        // re-draw error tick top
       elements.errorlines.selectAll(".error-1D-tick-top")
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
        elements.errorlines.selectAll(".error-1D-tick-bottom")
            .filter( function(d) {
                if(scales.yScaleType === "Log(Y)") {
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

    /**** Funciton to Update Scales ***********/
    my.changeScales = function(values) {
        
        scales.xScale = values.xScale.copy();
        scales.yScale = values.yScale.copy();

        // update scale types
        scales.yScaleType = values.yScaleType;

        // if theres a fit, update brush scale
        if(isFit) {
            scales.xScale2 = values.xScale.copy();
            scales.xScale2.range([0, dim.width]);
        }
        
        scales.xScale.range([0, dim.width]);
        scales.yScale.range([dim.height, 0]);
        
        // update plot
        my.update(plotData);
    }

    /***** Function To Reset to Original Coords Position ******/
    my.resetPlot = function() {
        elements.svg.select('.zoom').transition().duration(750)
            .call(zoomObj.zoom.transform, d3.zoomIdentity);
    }

    my.redrawFit = function(c) {
        // console.log("Coefficients are:", c);
        let temp = d3.select(".fitted-line").datum();
        let tempX = [];

        temp.forEach(function(d) {
            tempX.push(d.x);
        });

        let tempCoefficients = [];
        for(let key in c) {
            tempCoefficients.push(c[key]);
        }

        let newFitEq = fitEquation(tempCoefficients);

        let y_fitted = tempX.map(function(el) {
            return newFitEq(el);
        });

        // Return the fitted values
        let fittedPoints = [];
        
        for(let i = 0; i < y_fitted.length; i++) {
            fittedPoints.push({
                x: tempX[i],
                y: y_fitted[i]
            });
        }

        d3.select(".fitted-line").data([fittedPoints])
            .attr("d", plotLine);

        // Update coefficient values in results table
        d3.select("td#fit-coefficients").html(function() {
            let coeffString = "<ul>";
            for( let key in c) {
                coeffString += "<li>" + key + " = " + c[key].toFixed(6) + "</li>";
            }
            coeffString += "</ul>";
            return coeffString;
        });
    }

    my.checkError = function() {
        let len = document.getElementById("error-container").children.length;
        return len > 0 ? false : true;
    }

    // Return Module object for public use
    return my;
}(d3, _, $, eventBus));
    
// Export fit module for use in Plotfit.vue
export default fit1D;