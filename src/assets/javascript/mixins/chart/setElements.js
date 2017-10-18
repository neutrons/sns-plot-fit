import * as d3 from 'd3';

export const setElements = {
    methods: {
        setElements() {
            let vm = this;

            //Add a Line Plot Function
            vm.line = d3.line()
                .defined(function(d) { 
                    if(vm.scale.yType === 'Log(Y)') {
                        return d.y > 0;
                    } else {
                        return d;
                    }
                })
                .x(function (d) {
                    return vm.scale.x(d.x);
                })
                .y(function (d) {
                    return vm.scale.y(d.y);
                });

            // Add tool tip and hide it until invoked
            vm.elements.tooltip = d3.select("#app-container").append("div")
                .attr("id", "tooltip-" + vm.ID)
                .attr("class", "tooltip")
                .style("opacity", 0);

            // Add main chart area
            vm.elements.svg = d3.select("#plot-" + vm.ID).append("svg")
                .attr("viewBox", vm.dimensions.viewbox)
                .attr("perserveAspectRatio","xMidYMid meet")
                .attr("class", "chart-" + vm.ID)
                .attr("width", vm.dimensions.w + vm.margin.left + vm.margin.right)
                .attr("height", vm.dimensions.h + vm.margin.top + vm.margin.bottom);
            
            // Add clip path so points/line do not exceed plot boundaries
            vm.elements.svg.append("defs").append("clipPath")
                .attr("id", "clip-" + vm.ID)
                .append("rect")
                .attr("width", vm.dimensions.w)
                .attr("height", vm.dimensions.h);

            // Add plot area
            vm.elements.svg.append("rect")
                .attr("class", "plotbg")
                .attr("width", vm.dimensions.w)
                .attr("height", vm.dimensions.h)
                .attr("transform", "translate(" + vm.margin.left + "," + vm.margin.top + ")");

            // Add Axis and Gridline section
            vm.elements.axis = vm.elements.svg.append("g").attr("id", "axis-" + vm.ID);

            vm.elements.zoom = vm.elements.svg.append('g').attr('id', 'zoom-' + vm.ID);

            vm.elements.zoom.append('g')
                .attr("id", "zoom-" + vm.ID)
                .append('rect')
                .attr('class', 'zoom')
                .attr('width', vm.dimensions.w)
                .attr('height', vm.dimensions.h)
                .attr('transform', 'translate(' + vm.margin.left + ',' + vm.margin.top + ')');
            
            //Add Group to Plot Line/Points
            vm.elements.plot = vm.elements.svg.append("g")
                .attr('transform', 'translate(' + vm.margin.left + ',' + vm.margin.top + ')')
                .attr("class", "chart");

            // X Gridlines
            vm.elements.axis.append("g")
                .attr("transform", "translate(" + vm.margin.left + "," + (vm.dimensions.h + vm.margin.top) + ")")
                .attr("class", "gridline gridline--x");

            // Y Gridlines
            vm.elements.axis.append("g")
                .attr("transform", "translate(" + vm.margin.left + "," + vm.margin.top + ")")
                .attr("class", "gridline gridline--y");

            // Add X Axis
            vm.elements.axis.append("g")
                .attr("transform", "translate(" + vm.margin.left + "," + (vm.dimensions.h + vm.margin.top) + ")")
                .attr("class", "axis axis--x");

            // Add Y Axis
            vm.elements.axis.append("g")
                .attr("transform", "translate(" + vm.margin.left + "," + vm.margin.top + ")")
                .attr("class", "axis axis--y");
            
            // Add Y Axis Label
            vm.elements.svg.append("g").append("foreignObject")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(0," + (vm.dimensions.h/2) + ") rotate(-90)")
                .attr("id", "yLabel-" + vm.ID)
                .html("`" + vm.labels.y + "`");

            // Add X Axis Label
            vm.elements.svg.append("g").append("foreignObject")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(" + ((vm.dimensions.w + vm.margin.left + vm.margin.right)/2) + "," + (vm.dimensions.h + vm.margin.top*2.5) + ")")
                .attr("id", "xLabel-" + vm.ID)
                .html("`" + vm.labels.x + "`");

            // Add Chart Title
            vm.elements.svg.append("g").append("foreignObject")
                .attr("height", 100)
                .attr("width", 200)
                .attr("transform", "translate(" + ((vm.dimensions.w + vm.margin.left + vm.margin.right)/2) + ",10)")
                .attr("id", "plotTitle-" + vm.ID)
                .html("`" + vm.labels.y + "` vs `" + vm.labels.x + "`");

            // Call MathJax to make plot axis labels look pretty 
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, ["xLabel-" + vm.ID, "yLabel-" + vm.ID, "plotTitle-" + vm.ID]]);

            // Add the Legend
            vm.elements.legend = vm.elements.plot.append("g").attr("id", "legend-" + vm.ID);
        }
    }
}