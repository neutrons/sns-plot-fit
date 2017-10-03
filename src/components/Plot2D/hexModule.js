import * as d3 from 'd3';
import * as d3hex from 'd3-hexbin';
import _ from 'lodash';
import $ from 'jquery';

var hex = (function(d3, _, $, d3hex) {
    /******* Private Global Variables for Stitch Module **************/
        // Object for plot elements
        var elements = {
            svg: undefined,
            plot: undefined,
            axes: undefined,
            tooltip: undefined
        };

        // Object for plot scale functions
        var scales = {
            xScale: undefined,
            yScale: undefined,
            legendScale: undefined
        };

        // Object for axis generators
        var axesObj = {
            xAxis: undefined,
            yAxis: undefined
        }

        // Object for dimensions
        var dim = {
            width: undefined,
            height: undefined,
            legendWidth: undefined,
            legendHeight: undefined
        };

        var margin = {top: 50, right: 65, bottom: 50, left: 65 };

        // HEX PLOT VARIABLES
        var zoom = undefined;

    /******* End of Global for Stitch Module **************/

    // Module object
    var my = {};

    /*********** Hex Plot Function ************************/
    my.hexPlot = function(data, settings) {

            // Remove any current 2D plots
            d3.select(".chart-2D").remove();
            d3.select(".tooltip-2D").remove();
            
            //Set Data
            var binSize = _.cloneDeep(settings.binSize);
            var transformType = _.cloneDeep(settings.intensityTransformation);
            
            // console.log("These are the plot params", this.plotParams);
            var data = _.cloneDeep(data);
            
            // Filter invalid data points
            data = data.filter(el => Number.isFinite(el.qx) && Number.isFinite(el.qy) && Number.isFinite(el.intensity) && Number.isFinite(el.error));
            
            if(transformType === "Log") {
                // console.log("Transforming Hex Data...");
                data = data.filter(el => el.intensity > 0);
                data.forEach(function(el) {
                    el.intensity = Math.log(el.intensity);
                });
            }

            //Add tool tip and hide it until invoked
            elements.tooltip = d3.select("#app-container").append("div")
                .attr("class", "tooltip-2D")
                .style("opacity", 0);

            // Pull plot's parent container width, this will be used to scale the plot responsively
            
            var containerWidth = document.getElementById("plot-2D").offsetWidth;
            var viewHeight = containerWidth / (16/9);
            dim.height = viewHeight - margin.top - margin.bottom;
            dim.width = containerWidth - margin.left - margin.right;

            // Set legend dimensions
            dim.legendWidth = 25;
            dim.legendHeight = dim.height;

            // Set plot scales
            scales.xScale = d3.scaleLinear().range([0, dim.width]);
            scales.yScale = d3.scaleLinear().range([dim.height, 0]);

            // Set scale domains
            scales.xScale.domain(d3.extent(data, function(d) { return d.qx;}));
            scales.yScale.domain(d3.extent(data, function(d) { return d.qy;}));

            // Create axis generator
            axesObj.xAxis = d3.axisBottom(scales.xScale).ticks(10);
            axesObj.yAxis = d3.axisLeft(scales.yScale).ticks(10);

            // Set plot area
            var viewbox = "0 0 " + containerWidth + " " + viewHeight;
            elements.svg = d3.select("#plot-2D").append("svg")
                    .attr("viewBox", viewbox)
                    .attr("perserveAspectRatio","xMidYMid meet")
                    .attr('class', 'chart-2D')
                    .attr("width", dim.width + margin.left + margin.right)
                    .attr("height", dim.height + margin.top + margin.bottom);
            
            //Add clip path so hexagons do not exceed boundaries
            elements.svg.append("defs").append("clipPath")
                .attr("id", "clip-2D")
                .append("rect")
                .attr("width", dim.width)
                .attr("height", dim.height);

            // Create plot elements (plot area, axes, and color legend)
            elements.plot = elements.svg.append("g").attr("class", "plot")
                .attr("clip-path", "url(#clip-2D)")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            elements.axes = elements.svg.append("g").attr("id", "axis-2D")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            elements.legend = elements.svg.append("g").attr("class", "legend")
                .attr("transform", "translate(" + (dim.width+75) + "," + margin.top + ")");

            // Enable zoom
            zoom = d3.zoom().scaleExtent([1 / 2, 4]).on("zoom", my.zoomed);
            elements.svg.call(zoom);

            // Create hexbin generator
            var hexbin = d3hex.hexbin()
                .radius(binSize)
                .extent([[0, 0], [dim.width, dim.height]]);

            // Create points, which are used to plot hexbins
            var points = [];

            data.forEach(function(el) { 
                points.push([
                    scales.xScale(el.qx), 
                    scales.yScale(el.qy), el.intensity
                ]) 
            });

            var hexbins = hexbin(points);
            for(let i = 0; i < hexbins.length; i++) {
                let sum = 0;
                for(let j = 0; j < hexbins[i].length; j++) {
                    sum += hexbins[i][j][2];
                }
                let avgIntensity = sum / hexbins[i].length; // sum average intensity for a bin
                hexbins[i].avgIntensity = avgIntensity; // Assign new object value to hexbins
            }

            // console.log("Hex bins", hexbins);
            // console.log("x extent", d3.extent(data, function(d) { return d.Qx; }));
            // console.log("y extent", d3.extent(data, function(d) { return d.Qy; }));
            // console.log("intensity extent", d3.extent(hexbins, function(d) { return d.avgIntensity; }));
            // console.log("Bins extent", d3.extent(hexbins, function(d) { return d.length; }));

            // Create color scale generator using Viridis color set
            var color = d3.scaleSequential(d3.interpolateViridis)
                .domain(d3.extent(hexbins, function(d) { return d.avgIntensity; }));

            // Create legend scale generator
            scales.legendScale = d3.scaleLinear().domain(color.domain()).range([dim.legendHeight,0]).nice();

            // Create a value range for the legend color scale
            var valRange = d3.extent(hexbins, function(d) { return d.avgIntensity; });
            //console.log("Val Range", valRange);

            /********************************************************* 
                An interval is calculated to represent each "slice" of the
                legend's color values. Each "slice" will be stacked together
                to display the legend's vertical bar.
                
                Since height and range change depending on the data and
                size of chart, we dynamically find the interval
                e.g.) The extent of the average intensity = [-1, 1]
                       The height = 400
                       The interval = (1 - (-1)) / 400 
            **************************************************************/
            var interval = (valRange[1] - valRange[0]) / dim.height;
            //console.log("Interval", interval);

            elements.legend.selectAll(".bars")
                .data(d3.range(valRange[1],valRange[0], -interval), function(d) { return d; })
            .enter().append("rect")
                .attr("class", "bars")
                .attr("x", 0)
                .attr("y", function(d, i) { return i; })
                .attr("height", 1)
                .attr("width", dim.legendWidth)
                .style("fill", function(d, i ) { 
                    // console.log("D", d);
                    return color(d); 
                });

            elements.legend.append("g")
                .attr("transform", "translate(" + (dim.legendWidth) + ", 0)")
                .attr("class", "legend-axis legend-axis-y")
                .call(d3.axisRight(scales.legendScale));

            // Hex radius is tweaked to eliminate white spaces between hexagons
            // This needs to be further investigated because overlap isn't visible.
            var hexRad = binSize + 0.4;

            elements.plot.append("g")
                .attr("class", "hexagon")
            .selectAll("path")
            .data(hexbins)
            .enter().append("path")
                .attr("d", hexbin.hexagon(hexRad))
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                .attr("fill", function(d) { return color(d.avgIntensity); })
                .attr("stroke", "none")
                .attr("class", "hexagons")
                .on("mouseover", function(d) {
                    elements.tooltip.transition()
                        .duration(200)
                        .style("opacity", 1);

                    elements.tooltip.html("Qx: " + scales.xScale.invert(d.x).toFixed(4) + "<br/>" + "Qy: " + scales.yScale.invert(d.y).toFixed(4) + "<br/> Avg. Intensity: " + d.avgIntensity.toFixed(4))
                        .style("top", (d3.event.pageY - 40) + "px")
                        .style("left", (d3.event.pageX + 15) + "px");
                })
                .on("mouseout", function(d) {
                    elements.tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            elements.axes.append("g")
                .attr("class", "axis axis--y")
                .call(axesObj.yAxis);

            elements.axes.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + dim.height + ")")
                .call(axesObj.xAxis);

            // Add X Axis Label
            elements.svg.append("g").append("foreignObject")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(" + ((dim.width+margin.left+margin.right)/2) + "," + (dim.height+margin.top+margin.bottom/1.5) + ")")
                .attr("id", "xLabel2D")
                .html("`Qx`");

            // Add Y Axis Label
            elements.svg.append("g").append("foreignObject")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(0," + (dim.height/2) + ") rotate(-90)")
                .attr("id", "yLabel2D")
                .html("`Qy`");

            //Add Chart Title
            elements.svg.append("text")
                .attr("class", "charttitle")
                .attr("transform",
                    "translate(" + (dim.width / 2) + " ," +
                    (margin.top / 1.5) + ")")
                .text("Intensity Plot (Hexbin Size = " + binSize + ")");

            // Call MathJax to make plot axis labels look pretty
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, ["xLabel2D", "yLabel2D"]]);

            // Add responsive elements
            // Essentially when the plot-area gets resized it will look to the
            // width and scale the plot according to newly updated width.
            // The css file has min- and max-width's incase the resizing gets too small,
            // the plot will not scale below these dimensions.
            // Solution courtesy of: https://stackoverflow.com/a/26077110
            $.event.special.width2DChanged = {
                remove: function() {
                    $(this).children('iframe.width-changed-2D').remove();
                },
                add: function () {
                    var elm = $(this);
                    var iframe = elm.children('iframe.width-changed-2D');
                    if (!iframe.length) {
                        iframe = $('<iframe/>').addClass('width-changed-2D').prependTo(this);
                    }
                    var oldWidth = elm.width();
                    function elmResized() {
                        var width = elm.width();
                        if (oldWidth != width) {
                            elm.trigger('width2DChanged', [width, oldWidth]);
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

            var chart2D = $(".chart-2D");
            var aspectRatio = chart2D.width() / chart2D.height()
            var container = chart2D.parent();

            $("#plot-2D").on("width2DChanged", function() {
                var targetWidth = container.width();
                chart2D.attr("width", targetWidth);
                chart2D.attr("height", Math.round(targetWidth / aspectRatio));
            });
    }

    /********** Zoom Function  ***********************************************/
    my.zoomed = function() {
        // re-scale axes during zoom
        elements.axes.select(".axis--y").transition()
            .duration(50)
            .call(axesObj.yAxis.scale(d3.event.transform.rescaleY(scales.yScale)));

        elements.axes.select(".axis--x").transition()
            .duration(50)
            .call(axesObj.xAxis.scale(d3.event.transform.rescaleX(scales.xScale)));

        // Transform hexagons depending on the zoom
        elements.plot.selectAll(".hexagon")
            .attr("transform", d3.event.transform);      
    }

    /********** Plot Reset Function  *****************************************/
    my.resetPlot = function() {
        elements.svg.transition().duration(750)
            .call(zoom.transform, d3.zoomIdentity);
    }

    // Return Module object for public use
    return my;
}(d3, _, $, d3hex));
    
// Export hex module for use in Plot2D.vue
export default hex;