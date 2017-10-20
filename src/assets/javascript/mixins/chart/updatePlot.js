import * as d3 from 'd3';

export const updatePlot = {
    methods: {
        updatePlot(newData) {
            let vm = this;

            // First update plot data to new data
            vm.updateData(newData);
    
            // Then adjust scale's domain whenver new data is added
            vm.adjustDomains();           
    
            // Then rescale to zoom's scale
            let t = d3.zoomTransform( vm.elements.zoom.select('.zoom').node());
            let new_yScale = t.rescaleY(vm.scale.y); 
            let new_xScale = t.rescaleX(vm.scale.x);
            
            // Adjust axis and gridline labels
            vm.axis.y.scale(new_yScale);
            vm.axis.x.scale(new_xScale);
            vm.axis.yGrid.scale(new_yScale);
            vm.axis.xGrid.scale(new_xScale);
            
            // Transition axis and gridlines labels accordingly
            vm.elements.axis.transition().duration(750).select('.axis--y').call(vm.axis.y);
            vm.elements.axis.transition().duration(750).select('.axis--x').call(vm.axis.x);
            vm.elements.axis.transition().duration(750).select('.gridline--y').call(vm.axis.yGrid);
            vm.elements.axis.transition().duration(750).select('.gridline--x').call(vm.axis.xGrid);

            vm.line = d3.line()
                .defined(function(d) { 
                    if(vm.scale.yType === 'Log(Y)') {
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
    
            // Add and update data
            vm.dataNest.forEach(function (d, i) {
                
                // Add new elements if nothing exists
                if (d3.select("#line-" + vm.ID + "-" + d.key).empty()) {
                    
                    // Add line plot
                    vm.elements.plot.append("g").attr("id", "line-" + vm.ID + "-" + d.key)
                    .append("g")
                    .attr("clip-path", "url(#clip-" + vm.ID + ")")
                    .append("path")
                        .data([d.values])
                        .attr("class", "pointlines")
                        .attr("d", vm.line)
                        .style("fill", "none")
                        .style("stroke", function () {
                            return d.color = vm.color(d.key);
                        });;
                    
                    // Add error lines
                    vm.elements.plot.append("g").attr("id", "error-" + vm.ID + "-" + d.key)
                        .append("g")
                        .attr("clip-path", "url(#clip-" + vm.ID + ")")
                            .selectAll(".error-" + vm.ID)
                            .data(d.values)
                            .enter()
                            .append('line')
                                .attr('class', 'error error-' + vm.ID)
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
                                    if(d.y - d.e < 0 && vm.scale.yType === "Log(Y)") {
                                        return new_yScale(d.y)
                                    } else {
                                        return new_yScale(d.y - d.e);
                                    }
                                })
                                .style("stroke", function () {
                                    return d.color = vm.color(d.key);
                                });
                    
                    // Add error tick top
                    vm.elements.plot.append("g").attr("id", "error-" + vm.ID + "-top-" + d.key)
                        .append("g")
                        .attr("clip-path", "url(#clip-" + vm.ID + ")")
                            .selectAll(".error-" + vm.ID + "-tick-top")
                            .data(d.values)
                            .enter()
                            .append('line')
                                .attr('class', 'error-' + vm.ID + '-tick-top')
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
                                    return d.color = vm.color(d.key);
                                });
    
                    // Add error tick bottom
                    vm.elements.plot.append("g").attr("id", "error-" + vm.ID + "-bottom-" + d.key)
                        .append("g")
                        .attr("clip-path", "url(#clip-" + vm.ID + ")")
                            .selectAll(".error-" + vm.ID + "-tick-bottom")
                            .data(d.values)
                            .enter()
                            .append('line')
                                .attr('class', 'error-' + vm.ID + '-tick-bottom')
                                .filter( function(d) {
                                    if(vm.scale.yType === "Log(Y)") {
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
                                    return d.color = vm.color(d.key);
                                });
    
                    // Add Scatter plot
                    vm.elements.plot.append("g").attr("id", "scatter-" + vm.ID + "-" + d.key)
                        .append("g")
                        .attr("clip-path", "url(#clip-" + vm.ID + ")")
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
                                    return d.color = vm.color(d.key);
                                })
                                .on("mouseover", function (d) {
                                    
                                    vm.elements.tooltip.transition()
                                        .duration(200)
                                        .style("opacity", 1);
        
                                    vm.elements.tooltip.html("Name: " + d.name + "<br/>" + "X: " + d.x.toFixed(6) + "<br/>" + "Y: " + d.y.toFixed(6) + "<br/>" + "Error: " + d.e.toFixed(6))
                                        .style("top", (d3.event.pageY - 40) + "px")
                                        .style("left", (d3.event.pageX + 20) + "px");
                                })
                                .on("mouseout", function (d) {
        
                                    vm.elements.tooltip.transition()
                                        .duration(500)
                                        .style("opacity", 0);
                                })
                                .on("click", function(d,i) {
                                    //vm.removePoint(i, d.name);

                                        $("#myModal").modal('show')
                                        
                                        $("#btn-yes-delete").on("click", function(){
                                            $.when( yes(i, d.name)).done( function() {
                                                $("#myModal").modal('hide');
                                                vm.updatePlot(vm.plotData);
                                            })
                                        });
                                
                                        $("#btn-no-delete").on("click", function(){
                                            $("#btn-no-delete").off();
                                            $("#btn-yes-delete").off();
                                            $("#myModal").modal('hide');
                                        });

                                        function yes(index, name) {
                                            console.log("Yes");
                                            $("#btn-no-delete").off();
                                            $("#btn-yes-delete").off();
                                            
                                            // Remove point from current data
                                            vm.plotData.splice(index, 1);
                            
                                            // Remove point from stored dataset
                                            store.commit('removePoint', {name: name, index: index});
                                        }
                                });
                            
                } else {
                    
                    // Re-draw plot lines with new data
                    let lineSelect = vm.elements.plot.select("#line-" + vm.ID + "-" +d.key).select("path").data([d.values]);
                    
                    lineSelect.transition().duration(750)
                        .attr("d", vm.line);
    
                    // Re-draw Error Lines
                    let errorSelect = vm.elements.plot.select("#error-" + vm.ID + "-" +d.key).selectAll("line").data(d.values);
                    
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
                            if(d.y - d.e < 0 && vm.scale.yType === "Log(Y)") {
                                return new_yScale(d.y)
                            } else {
                                return new_yScale(d.y - d.e);
                            }
                        });
                    
                    // Enter new error Lines
                    errorSelect.enter()
                        .append('line')
                            .attr('class', 'error-' + vm.ID)
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
                                if(d.y - d.e < 0 && vm.scale.yType === "Log(Y)") {
                                    return new_yScale(d.y)
                                } else {
                                    return new_yScale(d.y - d.e);
                                }
                            })
                            .style("stroke", function () {
                                return d.color = vm.color(d.key);
                            });
    
                    // Remove old error lines
                    errorSelect.exit().remove();
    
                    // Re-draw Error Top
                    let errorTopSelect = vm.elements.plot.select("#error-" + vm.ID + "-top-" + d.key).selectAll("line").data(d.values);
                    
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
                        .attr('class', 'error-' + vm.ID + '-tick-top')
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
                            return d.color = vm.color(d.key);
                        });
    
                    // Remove old error tops
                    errorTopSelect.exit().remove();
    
                    // Re-draw Error Bottom
                    let errorBottomSelect = vm.elements.plot.select("#error-" + vm.ID + "-bottom-" + d.key).selectAll("line").data(d.values);
                    
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
                            .attr('class', 'error-' + vm.ID + '-tick-bottom')
                            .filter( function(d) {
                                if(vm.scale.yType === "Log(Y)") {
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
                                return d.color = vm.color(d.key);
                            });
    
                    // Remove old error bottoms
                    errorBottomSelect.exit().remove();
    
                    // Update all circles
                    let scatterSelect = vm.elements.plot.select("#scatter-" + vm.ID + "-" + d.key).selectAll("circle").data(d.values);
                    
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
                            return d.color = vm.color(d.key);
                        })
                        .on("mouseover", function (d) {
                            
                            vm.elements.tooltip.transition()
                                .duration(200)
                                .style("opacity", 1);
    
                            vm.elements.tooltip.html("Name: " + d.name + "<br/>" + "X: " + d.x.toFixed(6) + "<br/>" + "Y: " + d.y.toFixed(6) + "<br/>" + "Error: " + d.e.toFixed(6) + "<br/><br/><b>Note:</b> Click point to <em>delete</em> it.")
                                .style("top", (d3.event.pageY - 40) + "px")
                                .style("left", (d3.event.pageX + 20) + "px");
                        })
                        .on("mouseout", function (d) {
    
                            vm.elements.tooltip.transition()
                                .duration(500)
                                .style("opacity", 0);
                        })
                        .on("click", function(d,i) {
                            vm.removePoint(i, d.name);
                        });
    
                    // Remove old
                    scatterSelect.exit().remove();                        
                }
            });

            // Update legend
            vm.updateLegend();
            
            // Update Labels
            vm.updateLabels();
    
            // Add keys
            vm.removeLines();
        }
    }
}