<template>
<div id="Plot-2d" class="col-lg-10">
    <div id="plot-panel">
        <div class="panel-group">

            <!-- Plot Panel Heading  -->
            <div class="panel panel-primary">
                <div class="panel-heading">
                    <button id="btn-reset-2d-plot" class="btn btn-success btn-sm pull-left" @click="resetPlot" v-if="BUTTONDIS">Reset Plot</button>
                    <div id="plot-panel-collapse-2d">2D Plot <span class="glyphicon glyphicon-menu-up pull-right"></span></div>
                </div>
            </div>
            
            <!-- Plot Area  -->
            <div id="plot-collapse-2d" class="panel-body">
                <div id="plot-area-2d"></div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

import * as _ from 'lodash';
import * as d3 from 'd3';
import * as d3hex from 'd3-hexbin';
import $ from 'jquery';

export default {
    name: 'Plot-2d',
    props: ["BUTTONDIS"],
    data: function() {
        return {
            plotParams: {}
        }
    },
    created() {
        // Event Hooks for Main_2D.vue
        eventBus.$on('set-2D-parameters', this.setPlotParams);
    },
    methods: {
        resetPlot: function() {
            this.hexPlot();
        },
        setPlotParams: function(params) {
            // console.log("In the hex plot, here is the data", params);
            this.plotParams = _.cloneDeep(params);
        },
        hexPlot: function() {
            // console.log("Hex plotting...");
            // Remove any current 2D plots
            d3.select(".chart-2D").remove();
            d3.select(".tooltip-2D").remove();

            //Set Data
            var binSize = _.cloneDeep(this.plotParams.binSize);
            var transformType = _.cloneDeep(this.plotParams.intensityTransformation);
            
            // console.log("These are the plot params", this.plotParams);
            var data = _.cloneDeep(this.plotParams.data);
            
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
            var tooltip = d3.select("#app-container").append("div")
                .attr("class", "tooltip-2D")
                .style("opacity", 0);

            // Pull plot's parent container width, this will be used to scale the plot responsively
            var margin = {top: 50, right: 65, bottom: 50, left: 65 };
            var containerWidth = document.getElementById("plot-area-2d").offsetWidth;
            var viewHeight = containerWidth / (16/9);
            var height = viewHeight - margin.top - margin.bottom;
            var width = containerWidth - margin.left - margin.right;

            // Set legend dimensions
            var legendWidth = 25;
            var legendHeight = height;

            // Set plot scales
            var xScale = d3.scaleLinear().range([0, width]);
            var yScale = d3.scaleLinear().range([height, 0]);

            // Set scale domains
            xScale.domain(d3.extent(data, function(d) { return d.qx;}));
            yScale.domain(d3.extent(data, function(d) { return d.qy;}));

            // Create axis generator
            var xAxis = d3.axisBottom(xScale).ticks(10),
            yAxis = d3.axisLeft(yScale).ticks(10);

            // Set plot area
            var viewbox = "0 0 " + containerWidth + " " + viewHeight;
            var svg = d3.select("#plot-area-2d").append("svg")
                    .attr("viewBox", viewbox)
                    .attr("perserveAspectRatio","xMidYMid meet")
                    .attr('class', 'chart-2D')
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);
            
            //Add clip path so hexagons do not exceed boundaries
            svg.append("defs").append("clipPath")
                .attr("id", "clip-2D")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            // Create plot elements (plot area, axes, and color legend)
            var plot = svg.append("g").attr("class", "plot")
                .attr("clip-path", "url(#clip-2D)")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var axes = svg.append("g").attr("id", "axis-2D")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var legend = svg.append("g").attr("class", "legend")
                .attr("transform", "translate(" + (width+75) + "," + margin.top + ")");

            // Add zoom window
            svg.call(d3.zoom().scaleExtent([1 / 2, 4]).on("zoom", zoomed));

            // Create hexbin generator
            var hexbin = d3hex.hexbin()
                .radius(binSize)
                .extent([[0, 0], [width, height]]);

            // Create points, which are used to plot hexbins
            var points = [];
            data.forEach(function(el) { 
                points.push([xScale(el.qx), yScale(el.qy), el.intensity]) 
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
            var legendScale = d3.scaleLinear().domain(color.domain()).range([legendHeight,0]).nice();

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
            var interval = (valRange[1] - valRange[0]) / height;
            //console.log("Interval", interval);

            legend.selectAll(".bars")
                .data(d3.range(valRange[1],valRange[0], -interval), function(d) { return d; })
            .enter().append("rect")
                .attr("class", "bars")
                .attr("x", 0)
                .attr("y", function(d, i) { return i; })
                .attr("height", 1)
                .attr("width", legendWidth)
                .style("fill", function(d, i ) { 
                    // console.log("D", d);
                    return color(d); 
                });

            legend.append("g")
                .attr("transform", "translate(" + (legendWidth) + ", 0)")
                .attr("class", "legend-axis legend-axis-y")
                .call(d3.axisRight(legendScale));

            // Hex radius is tweaked to eliminate white spaces between hexagons
            // This needs to be further investigated because overlap isn't visible.
            var hexRad = binSize + 0.4;

            plot.append("g")
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
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 1);

                    tooltip.html("Qx: " + xScale.invert(d.x).toFixed(4) + "<br/>" + "Qy: " + yScale.invert(d.y).toFixed(4) + "<br/> Avg. Intensity: " + d.avgIntensity.toFixed(4))
                        .style("top", (d3.event.pageY - 40) + "px")
                        .style("left", (d3.event.pageX + 15) + "px");
                })
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            axes.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis);

            axes.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            // Add X Axis Label
            svg.append("g").append("foreignObject")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(" + ((width+margin.left+margin.right)/2) + "," + (height+margin.top+margin.bottom/1.5) + ")")
                .attr("id", "xLabel2D")
                .html("`Qx`");

            // Add Y Axis Label
            svg.append("g").append("foreignObject")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(0," + (height/2) + ") rotate(-90)")
                .attr("id", "yLabel2D")
                .html("`Qy`");

            //Add Chart Title
            svg.append("text")
                .attr("class", "charttitle")
                .attr("transform",
                    "translate(" + ((width + margin.left + margin.left) / 2) + " ," +
                    (margin.top / 1.5) + ")")
                .text("Intensity Plot (Hexbin Size = " + binSize + ")");

            // Call MathJax to make plot axis labels look pretty
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, ["xLabel2D", "yLabel2D"]]);

            function zoomed() {
                // re-scale axes during zoom
                axes.select(".axis--y").transition()
                    .duration(50)
                    .call(yAxis.scale(d3.event.transform.rescaleY(yScale)));

                axes.select(".axis--x").transition()
                    .duration(50)
                    .call(xAxis.scale(d3.event.transform.rescaleX(xScale)));

                // Transform hexagons depending on the zoom
                plot.selectAll(".hexagon")
                    .attr("transform", d3.event.transform);      
            }

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

            $("#plot-area-2d").on("width2DChanged", function() {
                var targetWidth = container.width();
                chart2D.attr("width", targetWidth);
                chart2D.attr("height", Math.round(targetWidth / aspectRatio));
            });
        }
    },
    watch: {
        plotParams: {
            handler: function() {
                this.hexPlot();
            },
            deep: true
        }
    }
}
</script>

<style scoped>
@import '../../assets/styles/plot-2D-styles.css';
</style>