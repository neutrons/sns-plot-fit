import * as d3 from 'd3';
import $ from 'jquery';

export default function(parameters) {
    //Setting 'this' as global when calling vue data letiables inside nested functions
            let vm = this;

            let data = parameters.data; //regular data to plot
            // Filter any infinity values, null, or NaN before plotting, this will happen when transforming log data = 0
            data = data.filter((d) => Number.isFinite(d.y) && Number.isFinite(d.x) && d.y > 0);
           
            //Catch any empty data and throw an error
            if(data.length < 1) {
                console.log("No data! Error!");
                //Remove any elements previously plotted
                d3.select(".stitch-chart").remove();
                // d3.select(".tooltip-stitch").remove();
                vm.isError = !vm.isError;
                
                if(vm.checkError()) {
                    let errorMsg = "<strong>Warning!</strong> No data to plot...might be due to the fit transformation resulting in invalid values.";
                    eventBus.$emit('error-message', errorMsg);
                }

                return;
            } else {
                vm.isError = false;
            }

            //Remove any elements previously plotted
            d3.select(".stitch-chart").remove();
            // d3.select(".tooltip-stitch").remove();

            // Object to store brush selections and scatter data
            let mySelections = {};
            let scatter = {}

            // Keep a default 3 of max brushes allowed
            let brushCount = parameters.brushCount - 1;

            // Keep the actual d3-brush functions and their IDs in a list:
            let brushes = [];

            // Set Color Scale
            let color = d3.scaleOrdinal(d3.schemeCategory20)
                .domain(parameters.colorDomain);

            // Pull plot's parent container width, this will be used to scale the plot responsively
            let containerWidth = document.getElementById("stitch-plot").offsetWidth;

            // Set chart dimensions
            let margin = { top: 80, right: 80, bottom: 80, left: 80 };
            let viewHeight = containerWidth / (16/9);
            let height = viewHeight - margin.top - margin.bottom;
            let width = containerWidth - margin.left - margin.right;

            // Set Scales
            let xScale = parameters.scales.xScale;
            xScale.range([0,width]);
            xScale.domain(d3.extent(data, function (d) {
                return d.x;
            }));

            let yScale = parameters.scales.yScale;
            let yScaleType = parameters.scales.yScaleType;
            yScale.range([height, 0]);
            yScale.domain(d3.extent(data, function(d) {
                return d.y;
            }));

            // Set Axis Labels
            let xTitle = parameters.scales.xScaleType;
            let yTitle = parameters.scales.yScaleType;

            // Set Axes
            let xAxis = d3.axisBottom(xScale).ticks(10);
            let yAxis = d3.axisLeft(yScale).ticks(10);
            let xGridline = d3.axisBottom(xScale).ticks(10).tickSize(-height).tickFormat("");
            let yGridline = d3.axisLeft(yScale).ticks(10).tickSize(-width).tickFormat("");

            // Add main chart area
            let viewbox = "0 0 " + containerWidth + " " + viewHeight;
            let svg = d3.select("#stitch-plot").append("svg")
                .attr("viewBox", viewbox)
                .attr("perserveAspectRatio","xMidYMid meet")
                .attr("class", "stitch-chart")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            
            // Add clip path so points/line do not exceed plot boundaries
            svg.append("defs").append("clipPath")
                .attr("id", "clipStitch")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            // Add plot area
            svg.append("rect")
                .attr("class", "plotbg")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Add Axis and Gridline section
            let axis = svg.append("g").attr("id", "axis-stitch");


            //Add Error-bars Section
            let errorlines = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            
            //Add Group to Plot Line/Points
            let plot = svg.append("g")
                .attr("class", "chart");

            // Add a brush section
            // let brushContainer = svg.append("g")
            //         .attr("class", "brush-container")
            //         .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // Generate a SVG group to keep brushes
            var gBrushes = svg.append('g')
                .attr("height", height)
                .attr("width", width)
                .attr("fill", "none")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("class", "brushes");

            // Only allow brushes when 2+ lines are plotted
            if(brushCount >= 1) {
                newBrush();
                drawBrushes();
            }

            //Add a Line Plot Function
            let plotLine = d3.line()
                .x(function (d) {
                    return xScale(d.x);
                })
                .y(function (d) {
                    return yScale(d.y);
                });

            // Create Zoom function
            let zoom = d3.zoom().on('zoom', zoomed);

            // X Gridlines
            axis.append("g")
                .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
                .attr("class", "gridline gridline--x")
                .call(xGridline);

            // Y Gridlines
            axis.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("class", "gridline gridline--y")
                .call(yGridline);

            // Add X Axis
            axis.append("g")
                .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
                .attr("class", "axis axis--x")
                .call(xAxis);

            // Add Y Axis
            axis.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("class", "axis axis--y")
                .call(yAxis);
            
            // Add Y Axis Label
            svg.append("g").append("foreignObject")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(15," + (height/2) + ") rotate(-90)")
                .attr("id", "yLabelStitch")
                .html("`" + yTitle + "`");

            // Add X Axis Label
            svg.append("g").append("foreignObject")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(" + ((width+margin.left+margin.right)/2) + "," + (height+margin.top+margin.bottom/2) + ")")
                .attr("id", "xLabelStitch")
                .html("`" + xTitle + "`");


            // Add Chart Title
            svg.append("g").append("foreignObject")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(" + ((width+margin.left+margin.right)/2) + ",25)")
                .attr("id", "plotTitleStitch")
                .html("`" + yTitle + "` vs `" + xTitle + "`");

            // Call MathJax to make plot axis labels look pretty 
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, ["xLabelStitch", "yLabelStitch", "plotTitleStitch"]]);
            
            // Nest the entries by name
            let dataNest = d3.nest()
                .key(function (d) {
                    return d.name;
                })
                .entries(data);

            // Loop through each name / key
            dataNest.forEach(function (d, i) {

                // Add line plot
                plot.append("path")
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
                errorlines.append("g")
                    .selectAll(".error")
                    .data(d.values)
                    .enter()
                    .append('line')
                    .attr("clip-path", "url(#clipStitch)")
                    .attr('class', 'error')
                    .attr('x1', function (d) {
                        return xScale(d.x);
                    })
                    .attr('x2', function (d) {
                        return xScale(d.x);
                    })
                    .attr('y1', function (d) {
                        return yScale(d.y + d.e);
                    })
                    .attr('y2', function (d) {
                        if(d.y - d.e < 0 && yScaleType === "Log(Y)") {
                            return yScale(d.y)
                        } else {
                            return yScale(d.y - d.e);
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
                    .attr("clip-path", "url(#clipStitch)")
                    .attr('class', 'error-tick-top')
                    .attr('x1', function (d) {
                        return xScale(d.x) - 4;
                    })
                    .attr('x2', function (d) {
                        return xScale(d.x) + 4;
                    })
                    .attr('y1', function (d) {
                        return yScale(d.y + d.e);
                    })
                    .attr('y2', function (d) {
                        return yScale(d.y + d.e);
                    })
                    .style("stroke", function () {
                        return d.color = color(d.key);
                    });

                    // Add error tick bottom
                    errorlines.append("g")
                    .selectAll(".error-tick-bottom")
                    .data(d.values)
                    .enter()
                    .append('line')
                    .attr("clip-path", "url(#clipStitch)")
                    .attr('class', 'error-tick-bottom')
                    .filter( function(d) {
                        if(yScaleType === "Log(Y)") {
                            return d.y - d.e > 0;
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
                        return yScale(d.y - d.e);
                    })
                    .attr('y2', function (d) {
                        return yScale(d.y - d.e);
                    })
                    .style("stroke", function () {
                        return d.color = color(d.key);
                    });

                    // Add Scatter plot
                    plot.append("g")
                        .attr("clip-path", "url(#clipStitch)")
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
                        });

                    // Add the Legend
                    let legend = plot.append("g");

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

            // Now everything is added, call zoom
            svg.call(zoom);
            
            /******* Store Scatter Data Points for Later Use  **********/
                (function() {
                        var i = 0;
                        let id = 'scatter-' + i;
                        let sel = d3.select('#' + id);

                        while(!sel.empty()) {
                            // Add scatter plot data to object
                            scatter[id] = { node: sel.selectAll('.dot'), data: sel.selectAll('.dot').data()};

                            // Increment values
                            i++;
                            id = 'scatter-' + i;
                            sel = d3.select('#' + id);
                        }
                    })();
            /******* End Storing Scatter Data  **********/

            /******* Brush features *******/
            function newBrush() {
                // console.log("new brush");
                var brush = d3.brushX()
                    .extent([[0, 0], [width, height]])
                    .on("start", brushstart)
                    .on("brush", brushed)
                    .on("end", brushend);

                    brushes.push({id: brushes.length, brush: brush});

                    function brushstart() {
                        // Brush start here
                    };

                function brushed() {
                    let selection = d3.event.selection.map(i => xScale.invert(i));
                    mySelections[this.id] = {start: selection[0], end: selection[1]};
                    // console.log("Selections are: ", mySelections);

                    // Maintain the converted and non-converted brush selections for zoom
                    vm.brushSelection = d3.event.selection;
                    let e = d3.event.selection.map(vm.brushXScale.invert, vm.brushXScale);
                    vm.brushExtent = e;
                    // console.log("Min = " + e[0] + " | Max = " + e[1]);
                }

                function brushend() {
                    // Figure out if our latest brush has a selection
                    var lastBrushID = brushes[brushes.length - 1].id;
                    var lastBrush = document.getElementById('brush-' + lastBrushID);
                    var selection = d3.brushSelection(lastBrush);

                    // If it does, that means we need another one
                    if (brushes.length < brushCount && selection && selection[0] !== selection[1]) {
                        newBrush();
                    }

                    // Always draw brushes
                    drawBrushes();
                }
            }

            function drawBrushes() {

                var brushSelection = gBrushes
                    .selectAll('.brush')
                    .data(brushes, function (d){return d.id});

                    // Set up new brushes
                brushSelection.enter()
                    .insert("g", '.brush')
                    .attr('class', 'brush')
                    .attr('id', function(brush){ return "brush-" + brush.id; })
                    .each(function(brushObject) {
                        // call the brush
                        brushObject.brush(d3.select(this));
                    });

                brushSelection
                    .each(function (brushObject){
                    d3.select(this)
                        .attr('class', 'brush')
                        .selectAll('.overlay')
                        .style('pointer-events', function() {
                        var brush = brushObject.brush;
                        if (brushObject.id === brushes.length-1 && brush !== undefined) {
                            return 'all';
                        } else {
                            return 'none';
                        }
                        });
                    })

                brushSelection.exit()
                    .remove();
            }
            /******* End of brush features *******/

            /* Add Event Listeners  for Toggling Zoom and Brush */

            // Initially set brushXScale to xScale, it will be update when zoom is activated below
            vm.brushXScale = xScale;

            let toggleEdit = function(choice) {

                // console.log(this.value);
                vm.toggleChoice = choice || this.value;
                
                if(vm.toggleChoice === 'zoom') {
                    // Toggle off all brushes
                    for(let i = 0, len = brushes.length; i < len; i++) {
                        d3.select('#brush-'+i).on('.brush', null);
                    }
                    
                    // Remove Brush Cursor Styles
                    d3.select('.stitch-chart').style('cursor', 'move');
                    d3.select('.brushes').selectAll('.selection').style("cursor", "initial");
                    d3.select('.brushes').selectAll('.overlay').style("cursor", "move");

                    svg.call(zoom);
                } else if (vm.toggleChoice === 'brush') {
                    svg.on('.zoom', null);
                    
                    // Toggle on all brushes
                    for(let i = 0, len = brushes.length; i < len; i++) {
                        brushes[i].brush(d3.select('#brush-'+i));
                    }

                    // Re-instate Brush Cursor Styles
                    d3.select('.brushes').selectAll('.selection').style("cursor", "move");
                    d3.select('.brushes').selectAll('.overlay').style("cursor", "crosshair");
                }
            }

            d3.selectAll('input[name=edit]').on('click', toggleEdit);
            toggleEdit(vm.toggleChoice);

            function zoomed() {
                // Update brushScale to reflect zoomed scale
                vm.brushXScale = d3.event.transform.rescaleX(xScale);
                if(vm.brushExtent.length > 0) vm.brushExtent = vm.brushSelection.map(vm.brushXScale.invert, vm.brushXScale);
                // console.log("Brush extent: ", vm.brushExtent.map(vm.brushXScale.invert, vm.brushXScale));
                // let t = d3.event.transform;
                // d3.select('.brush-container').call(brush.move, vm.brushXScale.range().map(t.invertX, t));
                // brushContainer.call(brush.move, vm.brushExtent.map(vm.brushXScale.invert, vm.brushXScale));
                
                // re-scale axes and gridlines during zoom
                axis.select(".axis--y").transition()
                    .duration(50)
                    .call(yAxis.scale(d3.event.transform.rescaleY(yScale)));

                axis.select(".axis--x").transition()
                    .duration(50)
                    .call(xAxis.scale(d3.event.transform.rescaleX(xScale)));

                axis.select(".gridline--y").transition()
                    .duration(50)
                    .call(yGridline.scale(d3.event.transform.rescaleY(yScale)));
                
                axis.select(".gridline--x").transition()
                    .duration(50)
                    .call(xGridline.scale(d3.event.transform.rescaleX(xScale)));

                // re-draw scatter plot;
                let new_yScale = d3.event.transform.rescaleY(yScale);
                let new_xScale = d3.event.transform.rescaleX(xScale);

                plot.selectAll("circle")
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

                plot.selectAll(".pointlines")
                    .attr("d", plotLine);

                // Re-draw error
                errorlines.selectAll('.error')
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
                        if(d.y - d.e < 0 && yScaleType === "Log(Y)") {
                            return new_yScale(d.y)
                        } else {
                            return new_yScale(d.y - d.e);
                        }
                    });
                
                // re-draw error tick top
                errorlines.selectAll(".error-tick-top")
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
                errorlines.selectAll(".error-tick-bottom")
                    .filter( function(d) {
                        if(yScaleType === "Log(Y)") {
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

            /************ Event and function for removing brushes *************/
            document.getElementById('remove-brushes-btn').addEventListener('click', () => {removeBrushes();});

            var removeBrushes = function() {
                gBrushes.selectAll('.brush').remove();

                brushes = [];
                mySelections = {};
                newBrush();
                drawBrushes();
                toggleEdit(vm.toggleChoice);
            }
            /************ End of removing brushes *************/

            /* End of Event listeners */

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
}
