import * as d3 from 'd3';
import _ from 'lodash';
import $ from 'jquery';

var stitch = (function(d3, _, $) {
    /******* Private Global Variables for Stitch Module **************/
        
        // Object for plot elements
        var elements = {
            svg: undefined,
            plot: undefined,
            axes: undefined,
            legend: undefined,
            errorLines: undefined
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
        var scatter = {};

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

            // Set Axis Labels
            let xTitle = parameters.scales.xScaleType;
            let yTitle = parameters.scales.yScaleType;

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
            elements.svg.append("g").append("foreignObject")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(15," + (height/2) + ") rotate(-90)")
                .attr("id", "yLabelStitch")
                .html("`" + yTitle + "`");

            // Add X Axis Label
            elements.svg.append("g").append("foreignObject")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(" + ((width+margin.left+margin.right)/2) + "," + (height+margin.top+margin.bottom/2) + ")")
                .attr("id", "xLabelStitch")
                .html("`" + xTitle + "`");


            // Add Chart Title
            elements.svg.append("g").append("foreignObject")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(" + ((width+margin.left+margin.right)/2) + ",25)")
                .attr("id", "plotTitleStitch")
                .html("`" + yTitle + "` vs `" + xTitle + "`");

            // Call MathJax to make plot axis labels look pretty 
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, ["xLabelStitch", "yLabelStitch", "plotTitleStitch"]]);
                
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

                        console.log("Scatter:", scatter);
                    })();
            /******* End Storing Scatter Data  **********/

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
        // Update brushScale to reflect new zoomed scale
        scale.brushXScale = d3.event.transform.rescaleX(scale.xScale);

        // If there are brushes, re-adjust selections according to new scale
        if(!my.isMySelection()) {
            
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
            .call(axesObj.yAxis.scale(d3.event.transform.rescaleY(scale.yScale)));

        elements.axes.select(".axis--x").transition()
            .duration(50)
            .call(axesObj.xAxis.scale(d3.event.transform.rescaleX(scale.xScale)));

        elements.axes.select(".gridline--y").transition()
            .duration(50)
            .call(axesObj.yGridline.scale(d3.event.transform.rescaleY(scale.yScale)));
        
        elements.axes.select(".gridline--x").transition()
            .duration(50)
            .call(axesObj.xGridline.scale(d3.event.transform.rescaleX(scale.xScale)));

        // re-draw scatter plot;
        let new_yScale = d3.event.transform.rescaleY(scale.yScale);
        let new_xScale = d3.event.transform.rescaleX(scale.xScale);

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

    // Function to check if there are selections available
    my.isMySelection = function() {
            // console.log(brushObj.brushSelections);
            // console.log(Object.keys(brushObj.brushSelections));
            
            if(Object.keys(brushObj.brushSelections).length === 0) {
                // console.log("No brushes to select/match data.");
                return true;
            } else {
                return false;
            }
            
    }

    var checkBrushCount = function(obj) {
        let result = false;

        for( let key in obj ) {
            let count = Object.keys(obj[key]).length;
            console.log("Keys", Object.keys(obj[key]));
            console.log("Count:", count);

            if(count !== 2) {
                result = true;
                break;
            }
        }

        return result;
    }
    // Function to identify how many lines are within a brush selection
    my.matchLine = function() {
    
        // If there are no brush selections, don't bother matching the data
        if (my.isMySelection()) return;

        let matches = {};
        
        for (let index = 0, len = dataNest.length; index < len; index++) {
            let tempData = dataNest[index].values; // pull data for line plot
            let tempName = dataNest[index].key; // pull file name for line plot
            
            for( let i = 0, len = tempData.length; i < len; i++) {
                //console.log("X = ", tempData[i].x, "Converted X = ", scale.xScale(tempData[i].x));
                let convertedX = scale.brushXScale(tempData[i].x);

                // Iterate through brush selections
                _.forIn(brushObj.brushSelections, (value, key) => {
                    let start = value.raw[0];
                    let end = value.raw[1];
                    

                    if( start <= convertedX && convertedX <= end) {
                        matches[key] = matches[key] || {};
                        matches[key][tempName] = matches[key][tempName] || [];
                        // Add data to matches object
                        matches[key][tempName].push(tempData[i]);
                    }
                })
            }
        }

        if(checkBrushCount(matches)) console.log("Too few/many lines select...");

        console.log("Selected Data: ", matches);
        console.log("Brush Selections:", brushObj.brushSelections);
        // console.log("Nest:", dataNest);
        // console.log("Scatter:", scatter);

        //return counts;
    }

    // Function to select data points within brush
    my.selectData = function() {
    
        // If there are no brush selections, don't bother finding the data
        if(my.isMySelection()) return;

        let counts = my.matchLine();
        return;

        console.log("Selecting data...", counts);

        let selectedData = {};

        for (let index = 0, len = dataNest.length; index < len; index++) {

            let tempData = dataNest[index].values;
            let selData = [];

            for (let id in brushObj.brushSelections) {

                let start = brushObj.brushSelections[id].converted[0];
                let end = brushObj.brushSelections[id].converted[1];

                console.log("Start = " + start + " | End = " + end);

                selData.push( 
                    tempData.filter(el => {
                        return start <= el.x && el.x <= end;
                    })
                );
            }

            selectedData[key] = _.uniq(_.flattenDeep(selData)); // take out duplicate selections
        }

        // console.log("Scatter:", scatter);
        console.log("Selected Data:", selectedData);
    }

    // Return Module object for public use
    return my;
}(d3, _, $));

// Export stitch module for use in PlotStitch.vue
export default stitch;