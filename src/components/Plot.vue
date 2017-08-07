<template>
  <div id="Plot">
          <div id="plot-panel" class="col-md-10">
          <div class="panel-group">

            <div class="panel panel-default">
              <div class="panel-heading">
                <button id="btn-reset-plot" class="btn btn-default btn-sm pull-left" @click="resetPlot" v-if="BUTTONDIS">Reset Plot</button>
                <div id="plot-panel-collapse">Plot <span class="glyphicon glyphicon-menu-up pull-right"></span></div>
              </div>
            </div>

            <div id="plot-collapse" class="panel-body">
              <div id="plot-area"></div>
              
              <!-- Fit Results Table to add fit results -->
              <div id="fit-results-table" class="table-responsive" v-show="FILETOFIT && fitName !== 'None'">          
                <table class="table table-bordered">
                  <caption><h4>Fit Results:</h4></caption>
                
                  <tbody>
                  <tr>
                    <td id="fit-file"></td>
                    <td id="fit-type"></td>
                    <td id="fit-points"></td>
                    <td id="fit-range"></td>
                    <td id="fit-error"></td>
                  </tr>
                
                    <tr>
                      <td colspan="2" class="sub-heading">Fit Configuration:</td>
                      <td colspan="2" class="sub-heading">Coefficients:</td>	
                      <td colspan="1" class="sub-heading">Note:</td>
                    </tr>
                    <tr>
                      <td colspan="2" id="fit-configs">
                      <ul>
                            <li id="fit-damping"></li>
                            <li id="fit-iterations"></li>
                            <li id="fit-tolerance"></li>
                            <li id="fit-gradient"></li>
                        </ul>
                      </td>
                      <td colspan="2" id="fit-coefficients">
                      </td>
                      <td colspan="1" id="fit-note">
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
        </div>
    </div>
  </div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../assets/javascript/eventBus';

import * as _ from 'lodash';
import * as d3 from 'd3';
import $ from 'jquery';
import fd from '../assets/javascript/fitData';

export default {
    name: 'Plot',
    props: ["FILETOFIT", "BUTTONDIS"],
    data: function() {
        return {
            fitEquation: null,
            plotLine: null,
            fitResults: null,
            plotParams: {},
            fitData: null,
            brushSelection: null
        }
    },
    computed: {
        fitName: function() {
            return this.plotParams.fitConfiguration.fit;
        },
        isFit: function() {
            return this.plotParams.fileToFit !== null && this.plotParams.fitConfiguration.fit !== 'None';
        }
    },
    methods: {
        plotData: function (parameters) {
            //Setting 'this' as global when calling vue data variables inside nested functions
            var self = this;

            //Remove any elements previously plotted
            d3.select("svg").remove();
            d3.select(".tooltip").remove();

            console.log("Plotting data...");
            
            // Set isFit to check if a file is selected to fit
            var isFit = self.isFit;

            // Set Color Scale
            // color domain is set in order for filenames to have
            // assigned colors. If this wasn't set and a filename
            // was unselected from the list, the plot would re-assign
            // color values to the plots causing confusion at first glance
            // reference: https://stackoverflow.com/questions/20590396/d3-scale-category10-not-behaving-as-expected
            
            var color = d3.scaleOrdinal(d3.schemeCategory20)
                .domain(parameters.colorDomain);

            // Pull plot's parent container width, this will be used to scale the plot responsively
            var containerWidth = document.getElementById("plot-area").offsetWidth;

            //Set chart dimensions
            if(isFit) {
                var margin = {
                    top: 50,
                    right: 50,
                    bottom: 100, // adjusts margin for slider
                    left: 50
                };
                
                // View Height is calculated on a 16:9 aspect ratio
                // This is to properly adjust the plot to the container width
                // This is mostly used when the user adjusts the browser 
                // from small (mobile) to large (desktop) window sizes.
                var viewHeight = containerWidth / (16/9);
                var height = viewHeight - margin.top - margin.bottom;
            } else {
                var margin = {
                    top: 50,
                    right: 50,
                    bottom: 50,
                    left: 50
                };

                var viewHeight = containerWidth / (16/9);
                var height = viewHeight - margin.top - margin.bottom;
            }
            
            
            var width = containerWidth - margin.left - margin.right;
            var data = parameters.data; //regular data to plot

            // Filter any infinity values before plotting, this will happen when transforming log data = 0
            data = data.filter((d) => Number.isFinite(d.y) && Number.isFinite(d.x) && d.y > 0);

            var xScale = parameters.scales.xScale;
            var xScaleType = parameters.scales.xScaleType;
            xScale.range([0,width]); //scales according to fit type
            var yScale = parameters.scales.yScale;
            var yScaleType = parameters.scales.yScaleType;
            yScale.range([height, 0]); //scales according to fit type
            var xTitle = parameters.fitConfiguration.xTransformation; //xTitle according to label
            var yTitle = parameters.fitConfiguration.yTransformation; //yTitle according to label

            // Set scale domains
            xScale.domain(d3.extent(data, function (d) {
                return d.x;
            }));
            yScale.domain(d3.extent(data, function(d) {
                return d.y;
            }));

            //Set Axes
            var xAxis = d3.axisBottom(xScale).ticks(10).tickSize(-height),
                yAxis = d3.axisLeft(yScale).ticks(10).tickSize(-width);

            //Add tool tip and hide it until invoked
            var tooltip = d3.select("#app-container").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            //Add main chart area
            var viewbox = "0 0 " + containerWidth + " " + viewHeight;
            var svg = d3.select("#plot-area").append("svg")
                .attr("viewBox", viewbox)
                .attr("perserveAspectRatio","xMidYMid meet")
                .attr("class", "sns-plot")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            
            //Add clip path so points/line do not exceed plot boundaries
            svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            //Add plot area
            svg.append("rect")
                .attr("class", "plotbg")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //Add Axis and Gridline section
            var axis = svg.append("g");

            //Add zoom window
            svg.append('rect')
                .attr('class', 'zoom')
                .attr('width', width)
                .attr('height', height)
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .call(d3.zoom().on("zoom", zoomed));

            //Add Error-bars Section
            var errorlines = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            
            //Add Group to Plot Line/Points
            var plot = svg.append("g")
                .attr("class", "chart");

            //Add a Line Plot Function
            self.plotLine = d3.line()
                .x(function (d) {
                    return xScale(d.x);
                })
                .y(function (d) {
                    return yScale(d.y);
                });
            
            /* CHECK ISFIT AND SETUP DIMENSIONS, FIT DATA, & SCALES */
            if(isFit) {
                console.log("Setting up some stuff...");

                var dataToFit = data.filter( (d) => d.name === parameters.fileToFit);

                // var dataFitted = calcLinear(dataToFit, "x", "y", minX, maxX);
                var fitResults = fd.fitData(dataToFit, parameters.fitConfiguration.equation, parameters.fitSettings);
                var coefficients = fitResults.coefficients;
                self.fitData = fitResults.fittedData;
                var fitError = fitResults.error;
                
                // Assign new fit equation to property data
                //this.fitEquation = fitResults.fitEquation;

                var margin2 = {
                    top: 25,
                    right: 50,
                    bottom: 50,
                    left: 50
                };

                var height2 = 25;

                var xScale2 = d3.scaleLinear().range([0, width]);
                xScale2.domain(xScale.domain());

                var xAxis2 = d3.axisBottom(xScale2);

                var slider = svg.append("g")
                    .attr("class", "slider")
                    .attr("transform", "translate(" + margin2.left + "," + (height + margin2.top + margin2.bottom) + ")");

                var brush = d3.brushX()
                    .extent([
                        [0, 0],
                        [width, height2]
                    ])
                    .on("brush", brushed);

                // append scatter plot to brush chart area
                slider.append("g").selectAll("dotslider")
                    .data(dataToFit)
                    .enter().append("line")
                    .attr('class', 'dotslider')
                    .attr("x1", function(d) { return xScale2(d.x); })
                    .attr("y1", height2)
                    .attr("x2", function(d) { return xScale2(d.x); })
                    .attr("y2", 0);

                //set initial brushSelection
                if(self.brushSelection === null) {
                    self.brushSelection = xScale.range(); // Default selection [0, max(x)]
                }

                slider.append("g")
                    .attr("class", "brush")
                    .call(brush)
                    .call(brush.move, self.brushSelection); 
                    //brush.move allows you to set the current selection for the brush element
                    // this will dynamically update according to the last selection made.
                    // This is to allow for persistent selections upon the plot being re-drawn.

                //console.log("Here is the xScale range", xScale.range());
                
                slider.append("g")
                    .attr("class", "axis axis--x")
                    .attr("transform", "translate(0," + height2 + ")")
                    .call(xAxis2);

            }

            /* END OF IS FIT SETUP*/

            //Add X Axis
            axis.append("g")
                .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
                .attr("class", "axis axis--x")
                .call(xAxis);

            //Add Y Axis
            axis.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("class", "axis axis--y")
                .call(yAxis);

            //Add Y Axis Label
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-weight", "bold")
                .text(yTitle);

            //Add X Axis Label
            svg.append("text")
                .attr("transform",
                    "translate(" + ((width + margin.left + margin.left) / 2) + " ," +
                    (height + margin.top + margin.bottom) + ")")
                .style("text-anchor", "middle")
                .style("font-weight", "bold")
                .text(xTitle);

            //Add Chart Title
            svg.append("text")
                .attr("class", "charttitle")
                .attr("transform",
                    "translate(" + ((width + margin.left + margin.left) / 2) + " ," +
                    (margin.top / 1.5) + ")")
                .text(yTitle + " vs " + xTitle);

            
            // Nest the entries by name
            var dataNest = d3.nest()
                .key(function (d) {
                    return d.name;
                })
                .entries(data);

            // Loop through each name / key
            dataNest.forEach(function (d, i) {

                //Add line plot
                plot.append("path")
                    .attr("clip-path", "url(#clip)")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .datum(d.values)
                    .attr("class", "pointlines")
                    .attr("d", self.plotLine)
                    .style("fill", "none")
                    .style("stroke", function () {
                        return d.color = color(d.key);
                    });;

                //Add error lines
                errorlines.append("g")
                    .selectAll(".error")
                    .data(d.values)
                    .enter()
                    .append('line')
                    .attr("clip-path", "url(#clip)")
                    .attr('class', 'error')
                    .attr('x1', function (d) {
                        return xScale(d.x);
                    })
                    .attr('x2', function (d) {
                        return xScale(d.x);
                    })
                    .attr('y1', function (d) {
                        return yScale(d.y + d.error);
                    })
                    .attr('y2', function (d) {
                        if(d.y - d.error < 0 && yScaleType === "Log(Y)") {
                            return yScale(d.y)
                        } else {
                            return yScale(d.y - d.error);
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
                    errorlines.append("g")
                    .selectAll(".error-tick-top")
                    .data(d.values)
                    .enter()
                    .append('line')
                    .attr("clip-path", "url(#clip)")
                    .attr('class', 'error-tick-top')
                    .attr('x1', function (d) {
                        return xScale(d.x) - 4;
                    })
                    .attr('x2', function (d) {
                        return xScale(d.x) + 4;
                    })
                    .attr('y1', function (d) {
                        return yScale(d.y + d.error);
                    })
                    .attr('y2', function (d) {
                        return yScale(d.y + d.error);
                    })
                    .style("stroke", function () {
                        return d.color = color(d.key);
                    });

                    //Add error tick bottom
                    errorlines.append("g")
                    .selectAll(".error-tick-bottom")
                    .data(d.values)
                    .enter()
                    .append('line')
                    .attr("clip-path", "url(#clip)")
                    .attr('class', 'error-tick-bottom')
                    .filter( function(d) {
                        if(yScaleType === "Log(Y)") {
                            return d.y - d.error > 0;
                        } else {
                            return true;
                        }
                    })
                    .attr('x1', function (d) {
                        return xScale(d.x) - 4;
                    })
                    .attr('x2', function (d) {
                        return xScale(d.x) + 4;
                    })
                    .attr('y1', function (d) {
                        return yScale(d.y - d.error);
                    })
                    .attr('y2', function (d) {
                        return yScale(d.y - d.error);
                    })
                    .style("stroke", function () {
                        return d.color = color(d.key);
                    });

                    //Add Scatter plot
                    plot.append("g")
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
                            return xScale(d.x);
                        })
                        .attr("cy", function (d) {
                            return yScale(d.y);
                        })
                        .attr("class", function(d) { return d.name + "-dot" })
                        .style("stroke", "white")
                        .style("stroke-width", "1px")
                        .style("opacity", 1)
                        .style("fill", function () {
                            return d.color = color(d.key);
                        })
                        .on("mouseover", function (d) {

                            d3.select(this).attr("r", 6);

                            tooltip.transition()
                                .duration(200)
                                .style("opacity", 1);
                            tooltip.html("Name: " + d.name + "<br/>" + "X: " + d.x.toFixed(6) + "<br/>" + "Y: " + d.y.toFixed(6) + "<br/>" + "Error: " + d.error.toFixed(6))
                                .style("top", (d3.event.pageY - 40) + "px")
                                .style("left", (d3.event.pageX + 20) + "px");
                        })
                        .on("mouseout", function (d) {
                            d3.select(this).attr("r", 4);

                            tooltip.transition()
                                .duration(500)
                                .style("opacity", 0);
                        });

                    // Add the Legend
                    var legend = plot.append("g");

                    legend.append("rect")
                        .attr("x", width - margin.right - margin.right)
                        .attr("y", (margin.top + 20) + i * 25)
                        .attr("class", "legend")
                        .style("fill", function () {
                            return d.color = color(d.key);
                        })
                        .attr("height", "8px")
                        .attr("width", "8px");

                    legend.append("text")
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

            // Code for fitted line
            if(isFit) {
                var minX = d3.min(dataToFit, function(d) { return d.x });
                var maxX = d3.max(dataToFit, function(d) { return d.x });

                //Add fitted lin
                plot.append("path")
                    .attr("clip-path", "url(#clip)")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .datum(self.fitData)
                    .attr("class", "fitted-line")
                    .attr("d", self.plotLine)
                    .style("fill", "none")
                    .style("stroke", color(parameters.fileToFit));

                // Add fit results below chart
                d3.select("td#fit-file").html("<b>File: </b>" + parameters.fileToFit);
                d3.select("td#fit-type").html("<b>Fit Type:</b> " + parameters.fitConfiguration.fit);
                d3.select("td#fit-points").html("<b>No. Points:</b> " + dataToFit.length);
                d3.select("td#fit-range").html("<b>Fit Range:</b> (" + minX.toFixed(3) + ", " + maxX.toFixed(3) + ")");
                d3.select("td#fit-error").html("<b>Fit Error:</b> " + fitError.toFixed(3));
                
                d3.select("td#fit-coefficients").html(function() {
                    let coeffString = "<ul>";
                    for( let key in coefficients) {
                        coeffString += "<li>" + key + " = " + coefficients[key].toFixed(3) + "</li>";
                    }
                    coeffString += "</ul>";
                    return coeffString;
                });

                d3.select("li#fit-damping").html("<b>Damping: </b>" + parameters.fitSettings.damping);
                d3.select("li#fit-iterations").html("<b>No. Iterations: </b>" + parameters.fitSettings.maxIterations);
                d3.select("li#fit-tolerance").html("<b>Error Tolerance: </b>" + parameters.fitSettings.errorTolerance);
                d3.select("li#fit-gradient").html("<b>Gradient Difference: </b>" + parameters.fitSettings.gradientDifference);

                d3.select("#fit-note").html(parameters.fitConfiguration.note);
            }

            // Create brush function redraw scatterplot with selection
            function brushed() {
                // console.log("Calling brush...");
                self.brushSelection = d3.event.selection;

                if (self.brushSelection !== null) {
                    var e = d3.event.selection.map(xScale2.invert, xScale2);

                    slider.selectAll(".dotslider")
                        .style("stroke", function (d) {
                            if(e[0] <= d.x && d.x <= e[1]) {
                                return d.color = color(d.name);
                            } else {
                                return "slategray";
                            }
                        })

                    let selectedData = dataToFit.filter(function(d) {
                        return e[0] <= d.x && d.x <= e[1];
                    })
                    
                    fitResults = fd.fitData(selectedData, parameters.fitConfiguration.equation, parameters.fitSettings);
                    coefficients = fitResults.coefficients;
                    self.fitData = fitResults.fittedData;
                    fitError = fitResults.error;

                    // Re-assign updated fit equation and fitline function
                    self.fitEquation = fitResults.fitEquation;
                    //self.fitLineFunction = brushPlotLine;

                    //Emit coefficients to controls panel
                    eventBus.$emit('update-coefficients', coefficients);

                    //Add line plot
                    plot.select(".fitted-line").data([self.fitData])
                        .attr("d", self.plotLine);

                    // Revise fit results below chart
                    d3.select("td#fit-file").html("<b>File: </b>" + parameters.fileToFit);
                    d3.select("td#fit-type").html("<b>Fit Type:</b> " + parameters.fitConfiguration.fit);
                    d3.select("td#fit-points").html("<b>No. Points:</b> " + selectedData.length);
                    d3.select("td#fit-range").html("<b>Fit Range:</b> (" + e[0].toFixed(3) + ", " + e[1].toFixed(3) + ")");
                    d3.select("td#fit-error").html("<b>Fit Error:</b> " + fitError.toFixed(3));
                    
                    d3.select("td#fit-coefficients").html(function() {
                        let coeffString = "<ul>";
                        for( let key in coefficients) {
                            coeffString += "<li>" + key + " = " + coefficients[key].toFixed(3) + "</li>";
                        }
                        coeffString += "</ul>";
                        return coeffString;
                    });
                }
            }

            function zoomed() {
                // re-scale axes during zoom
                axis.select(".axis--y").transition()
                    .duration(50)
                    .call(yAxis.scale(d3.event.transform.rescaleY(yScale)));

                axis.select(".axis--x").transition()
                    .duration(50)
                    .call(xAxis.scale(d3.event.transform.rescaleX(xScale)));

                // re-draw scatter plot;
                var new_yScale = d3.event.transform.rescaleY(yScale);
                var new_xScale = d3.event.transform.rescaleX(xScale);

                plot.selectAll("circle")
                    .attr("cy", function (d) {
                        return new_yScale(d.y);
                    })
                    .attr("cx", function (d) {
                        return new_xScale(d.x);
                    });

                //re-draw line
                self.plotLine = d3.line()
                    .x(function (d) {
                        return new_xScale(d.x);
                    })
                    .y(function (d) {
                        return new_yScale(d.y);
                    });

                plot.selectAll(".pointlines")
                    .attr("d", self.plotLine);

                if(isFit) {
                    // Update brush scales
                    //brushPlotLine = new_plotLine;

                    // Re-draw fitted line
                    plot.select(".fitted-line")
                        .attr("d", self.plotLine);
                }

                //re-draw error
                errorlines.selectAll('.error')
                    .attr('x1', function (d) {
                        return new_xScale(d.x);
                    })
                    .attr('x2', function (d) {
                        return new_xScale(d.x);
                    })
                    .attr('y1', function (d) {
                        return new_yScale(d.y + d.error);
                    })
                    .attr('y2', function (d) {
                        if(d.y - d.error < 0 && yScaleType === "Log(Y)") {
                            // console.log("Below zero! d.y = " + d.y + " | d.error = " + d.error + "| d.y - d.error = " + (d.y - d.error));
                            return new_yScale(d.y)
                        } else {
                            return new_yScale(d.y - d.error);
                        }
                    });
                
                //re-draw error tick top
                errorlines.selectAll(".error-tick-top")
                    .attr('x1', function (d) {
                        return new_xScale(d.x) - 4;
                    })
                    .attr('x2', function (d) {
                        return new_xScale(d.x) + 4;
                    })
                    .attr('y1', function (d) {
                        return new_yScale(d.y + d.error);
                    })
                    .attr('y2', function (d) {
                        return new_yScale(d.y + d.error);
                    });

                //re-draw error tick bottom
                errorlines.selectAll(".error-tick-bottom")
                    .filter( function(d) {
                        if(yScaleType === "Log(Y)") {
                            return d.y - d.error > 0;
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
                        return new_yScale(d.y - d.error);
                    })
                    .attr('y2', function (d) {
                        return new_yScale(d.y - d.error);
                    });
            }

            // Add responsive elements
            // Essentially when the plot-area gets resized it will look to the
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

            var snsChart = $(".sns-plot");
            var aspectRatio = snsChart.width() / snsChart.height()
            var container = snsChart.parent();

            $("#plot-area").on("widthChanged", function() {
                var targetWidth = container.width();
                snsChart.attr("width", targetWidth);
                snsChart.attr("height", Math.round(targetWidth / aspectRatio));
            });

    },
    resetPlot: function () {
        this.plotData(this.plotParams);
    },
    redrawFit: function(c) {
        console.log("Coefficients are:", c);
        let temp = d3.select(".fitted-line").datum();
        let tempX = [];

        temp.forEach(function(d) {
            tempX.push(d.x);
        });

        let tempCoefficients = [];
        for(let key in c) {
            tempCoefficients.push(c[key]);
        }

        let newFitEq = this.fitEquation(tempCoefficients);

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
            .attr("d", this.plotLine);

        // Update coefficient values in results table
        d3.select("td#fit-coefficients").html(function() {
            let coeffString = "<ul>";
            for( let key in c) {
                coeffString += "<li>" + key + " = " + c[key].toFixed(6) + "</li>";
            }
            coeffString += "</ul>";
            return coeffString;
        });
    },
    setParameters: function(parameters) {
        this.plotParams = _.cloneDeep(parameters);
    },
    resetBrushSelection: function() {
        this.brushSelection = null;
    }
},
created() {
        //Listen for cofficient changes
        eventBus.$on("coefficients-updated", this.redrawFit);

        // Listen for events form Main.vue
        eventBus.$on('set-parameters', this.setParameters);
        eventBus.$on('reset-brush-selection', this.resetBrushSelection);
    },
    watch: {
        plotParams: {
            handler: function() {
                this.$nextTick(function() { this.plotData(this.plotParams);});
            },
            deep: true
        }
    }
}
</script>

<style scoped>
@import '../assets/styles/plot-styles.css';
</style>