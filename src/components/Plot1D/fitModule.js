import * as d3 from 'd3';
import _ from 'lodash';
import $ from 'jquery';

// The eventBus serves as the means to communicating between components.
// Here it's being used in moduleStitch to communicate to App.vue for error messages
import { eventBus } from '../../assets/javascript/eventBus.js';

import fd from './fitData.js';

var fit1D = (function(d3, _, $, eventBus) {
    /******* Private Global Variables for Stitch Module **************/

        // Object for plot elements
        var elements = {
            svg: undefined,
            plot: undefined,
            axis: undefined,
            legend: undefined,
            errorLines: undefined,
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

        var margin = {
            top: 80,
            bottom: 80,
            left: 80,
            right: 80
        };

        var margin2 = {
            top: 10,
            right: 50,
            bottom: 70,
            left: 80
        };

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
            brushSelection: null
        };

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

        // Array to store a stitched line's data
        var fitLineData = [];
        var fitEquation = undefined;
        var plotParameters = undefined;

        // Generator for color
        var color = undefined;

        var isFit = undefined;

    /******* End of Global for Stitch Module **************/

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
                bottom: 160, // adjusts margin for slider
                left: 80
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
                bottom: 80,
                left: 80
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

        dataToFit = plotData.filter( (d) => d.name === plotParameters.fileToFit);

        fitResults = fd.fitData(dataToFit, plotParameters.fitConfiguration.equation, plotParameters.fitSettings);
        coefficients = fitResults.coefficients;
        fitData = fitResults.fittedData;
        fitError = fitResults.error;
        
        // Assign new fit equation to property data
        // fitEquation = fitResults.fitEquation;
        // console.log("FIT EQUATION:", fitEquation);

        margin2 = {
            top: 10,
            right: 50,
            bottom: 70,
            left: 80
        };

        dim.height2 = 25;
        
        scales.xScale2 = d3.scaleLinear().range([0, dim.width]);
        scales.xScale2.domain(scales.xScale.domain());

        axesObj.xAxis2 = d3.axisBottom(scales.xScale2);

        elements.slider = elements.svg.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + margin2.left + "," + (dim.height + margin2.top + margin2.bottom) + ")");

        brushObj.brush = d3.brushX()
            .extent([
                [0, 0],
                [dim.width, dim.height2]
            ])
            .on("brush", my.brushed);

        // append scatter plot to brush chart area
        elements.slider.append("g").selectAll("dotslider")
            .data(dataToFit)
            .enter().append("line")
            .attr('class', 'dotslider')
            .attr("x1", function(d) { return scales.xScale2(d.x); })
            .attr("y1", dim.height2)
            .attr("x2", function(d) { return scales.xScale2(d.x); })
            .attr("y2", 0);

        // set initial brushSelection
        if(brushObj.brushSelection === null) {
            brushObj.brushSelection = scales.xScale.range(); // Default selection [0, max(x)]
        }

        elements.slider.append("g")
            .attr("class", "brush")
            .call(brushObj.brush)
            .call(brushObj.brush.move, brushObj.brushSelection); 
            // brush.move allows you to set the current selection for the brush element
            // this will dynamically update according to the last selection made.
            // This is to allow for persistent selections upon the plot being re-drawn.
        
        elements.slider.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + dim.height2 + ")")
            .call(axesObj.xAxis2);
    }

    my.addFitLine = function() {
        var minX = d3.min(dataToFit, function(d) { return d.x });
        var maxX = d3.max(dataToFit, function(d) { return d.x });

        // Add fitted lin
        elements.plot.append("path")
            .attr("clip-path", "url(#clip)")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .datum(fitData)
            .attr("class", "fitted-line")
            .attr("d", plotLine)
            .style("fill", "none")
            .style("stroke", color(plotParameters.fileToFit));

        // Add fit results below chart
        d3.select("td#fit-file").html("<b>File tessssst: </b>" + plotParameters.fileToFit);
        d3.select("td#fit-type").html("<b>Fit Type:</b> " + plotParameters.fitConfiguration.fit);
        d3.select("td#fit-points").html("<b>No. Points:</b> " + dataToFit.length);
        d3.select("td#fit-range").html("<b>Fit Range:</b> (" + minX.toExponential(5) + ", " + maxX.toExponential(5) + ")");
        d3.select("td#fit-error").html("<b>Fit Error:</b> " + fitError.toExponential(5));
        
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
                        let RgX = coefficients[key] * scales.xScale.invert(brushObj.brushSelection[1]);
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

        plotParameters = _.cloneDeep(parameters);

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
            
            if(vm.checkError()) {
                let errorMsg = "<strong>Error!</strong> No data to plot...might be due to the fit transformation resulting in invalid values.";
                eventBus.$emit('error-message', errorMsg, 'danger');
            }

            return;
        } else {
            vm.isError = false;
        }

        //Remove any elements previously plotted
        d3.select(".chart-1D").remove();
        d3.select("#tooltip-1D").remove();
        
        // Set isFit to check if a file is selected to fit
        isFit = plotParameters.fileToFit !== null && plotParameters.fitConfiguration.fit !== 'None';

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
        var tooltip = d3.select("#app-container").append("div")
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
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(zoomObj.zoom);

        //Add Error-bars Section
        elements.errorlines = elements.svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        
        //Add Group to Plot Line/Points
        elements.plot = elements.svg.append("g")
            .attr("class", "chart");
        
        /* CHECK ISFIT AND SETUP Slider DIMENSIONS, FIT DATA, & SCALES */
        if(isFit)   my.initSlider();
        /* END OF IS FIT SETUP*/

        // X Gridlines
        elements.axis.append("g")
            .attr("transform", "translate(" + margin.left + "," + (dim.height + margin.top) + ")")
            .attr("class", "gridline gridline--x")
            .call(axesObj.xGridline);

        // Y Gridlines
        elements.axis.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "gridline gridline--y")
            .call(axesObj.yGridline);

        // Add X Axis
        elements.axis.append("g")
            .attr("transform", "translate(" + margin.left + "," + (dim.height + margin.top) + ")")
            .attr("class", "axis axis--x")
            .call(axesObj.xAxis);

        // Add Y Axis
        elements.axis.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("class", "axis axis--y")
            .call(axesObj.yAxis);
        
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
            .attr("transform", "translate(" + ((dim.width+margin.left+margin.right)/2) + "," + (dim.height+margin.top+margin.bottom/2) + ")")
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
        
        // Nest the entries by name
        dataNest = d3.nest()
            .key(function (d) {
                return d.name;
            })
            .entries(plotData);

        // Loop through each name / key
        dataNest.forEach(function (d, i) {

            // Add line plot
            elements.plot.append("path")
                .attr("clip-path", "url(#clip)")
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
                .attr("clip-path", "url(#clip)")
                .attr('class', 'error')
                .attr('x1', function (d) {
                    return scales.xScale(d.x);
                })
                .attr('x2', function (d) {
                    return scales.xScale(d.x);
                })
                .attr('y1', function (d) {
                    return scales.yScale(d.y + d.e);
                })
                .attr('y2', function (d) {
                    if(d.y - d.e < 0 && scales.yScaleType === "Log(Y)") {
                        return scales.yScale(d.y)
                    } else {
                        return scales.yScale(d.y - d.e);
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
                .attr("clip-path", "url(#clip)")
                .attr('class', 'error-tick-top')
                .attr('x1', function (d) {
                    return scales.xScale(d.x) - 4;
                })
                .attr('x2', function (d) {
                    return scales.xScale(d.x) + 4;
                })
                .attr('y1', function (d) {
                    return scales.yScale(d.y + d.e);
                })
                .attr('y2', function (d) {
                    return scales.yScale(d.y + d.e);
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
                .attr("clip-path", "url(#clip)")
                .attr('class', 'error-tick-bottom')
                .filter( function(d) {
                    if(scales.yScaleType === "Log(Y)") {
                        return d.y - d.e > 0;
                    } else {
                        return true;
                    }
                })
                .attr('x1', function (d) {
                    return scales.xScale(d.x) - 4;
                })
                .attr('x2', function (d) {
                    return scales.xScale(d.x) + 4;
                })
                .attr('y1', function (d) {
                    return scales.yScale(d.y - d.e);
                })
                .attr('y2', function (d) {
                    return scales.yScale(d.y - d.e);
                })
                .style("stroke", function () {
                    return d.color = color(d.key);
                });

                // Add Scatter plot
                elements.plot.append("g")
                    .attr("clip-path", "url(#clip)")
                    .attr("class", "dot")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .selectAll("dot")
                    .data(d.values)
                    .enter()
                    .append("circle")
                    .filter(function(d) {
                        return d.x !== null && d.x !== NaN && d.y !== null && d.y !== NaN;
                    })
                    .attr("r", 4)
                    .attr("cx", function (d) {
                        return scales.xScale(d.x);
                    })
                    .attr("cy", function (d) {
                        return scales.yScale(d.y);
                    })
                    .attr("class", function(d) { return d.name + "-dot" })
                    .style("stroke", "white")
                    .style("stroke-width", "1px")
                    .style("opacity", 1)
                    .style("fill", function () {
                        return d.color = color(d.key);
                    })
                    .on("mouseover", function (d) {

                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 1);
                        tooltip.html("Name: " + d.name + "<br/>" + "X: " + d.x.toFixed(6) + "<br/>" + "Y: " + d.y.toFixed(6) + "<br/>" + "Error: " + d.e.toFixed(6))
                            .style("top", (d3.event.pageY - 40) + "px")
                            .style("left", (d3.event.pageX + 20) + "px");
                    })
                    .on("mouseout", function (d) {

                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

                // Add the Legend
                elements.legend = elements.plot.append("g");

                elements.legend.append("rect")
                    .attr("x", dim.width - margin.right - margin.right)
                    .attr("y", (margin.top + 20) + i * 25)
                    .attr("class", "legend")
                    .style("fill", function () {
                        return d.color = color(d.key);
                    })
                    .attr("height", "8px")
                    .attr("width", "8px");

                elements.legend.append("text")
                    .attr("x", dim.width - margin.right - margin.right + 15)
                    .attr("y", (margin.top + 28) + i * 25)
                    .attr("class", "legend")
                    .style("fill", function () {
                        return d.color = color(d.key);
                    })
                    .style("font-size", "12px")
                    .style("font-weight", "bold")
                    .text(d.key);

        });

        // If fit is select add elements for fitted line
        if(isFit)   my.addFitLine();

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
    }

    my.update = function() {

    }

    // Create brush function redraw scatterplot with selection
    my.brushed = function() {
        // console.log("Calling brush...");
        brushObj.brushSelection = d3.event.selection;
        
        var e = d3.event.selection.map(scales.xScale2.invert, scales.xScale2);
        
        let selectedData = dataToFit.filter(function(d) {
            return e[0] <= d.x && d.x <= e[1];
        })

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
                if(vm.checkError()) {
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
            d3.select("td#fit-file").html("<b>File tesssst: </b>" + plotParameters.fileToFit);
            d3.select("td#fit-type").html("<b>Fit Type:</b> " + plotParameters.fitConfiguration.fit);
            d3.select("td#fit-points").html("<b>No. Points:</b> " + selectedData.length);
            d3.select("td#fit-range").html("<b>Fit Range:</b> (" + e[0].toExponential(5) + ", " + e[1].toExponential(5) + ")");
            d3.select("td#fit-error").html("<b>Fit Error:</b> " + fitError.toExponential(5));
            
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
                            let RgX = coefficients[key] * scales.xScale.invert(brushObj.brushSelection[1]);
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
            if(vm.checkError()) {
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
                if(d.y - d.e < 0 && scales.yScaleType === "Log(Y)") {
                    // console.log("Below zero! d.y = " + d.y + " | d.e = " + d.e + "| d.y - d.e = " + (d.y - d.e));
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

    // Return Module object for public use
    return my;
}(d3, _, $, eventBus));
    
// Export stitch module for use in PlotStitch.vue
export default fit1D;