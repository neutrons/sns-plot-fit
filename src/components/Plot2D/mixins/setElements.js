import * as d3 from 'd3';

export const setElements = {
    methods: {
        setElements() {
            let vm = this;

            // Add tool tip and hide it until invoked
            vm.elements.tooltip = d3.select("#app-container").append("div")
                .attr("class", "tooltip-" + vm.ID)
                .style("opacity", 0);

            vm.elements.svg = d3.select("#plot-" + vm.ID).append("svg")
                .attr("viewBox", vm.dimensions.viewbox)
                .attr("perserveAspectRatio","xMidYMid meet")
                .attr('class', 'chart-' + vm.ID)
                .attr("width", vm.dimensions.w + vm.margin.left + vm.margin.right)
                .attr("height", vm.dimensions.h + vm.margin.top + vm.margin.bottom);
    
            //Add clip path so hexagons do not exceed boundaries
            vm.elements.svg.append("defs").append("clipPath")
                .attr("id", "clip-" + vm.ID)
                .append("rect")
                .attr("width", vm.dimensions.w)
                .attr("height", vm.dimensions.h);

            // Create plot elements (plot area, axis, and color legend)
            vm.elements.plot = vm.elements.svg.append("g").attr("class", "plot")
                .attr("clip-path", "url(#clip-" + vm.ID + ")")
                .attr("transform", "translate(" + vm.margin.left + "," + vm.margin.top + ")");
                    
            vm.elements.plot.append('g')
                .append('rect')
                .attr('class', 'zoom')
                .attr('width', vm.dimensions.w)
                .attr('height', vm.dimensions.h);

            vm.elements.plot.append("g").attr("class", "hexagon");            

            vm.elements.axis = vm.elements.svg.append("g").attr("id", "axis-" + vm.ID)
                .attr("transform", "translate(" + vm.margin.left + "," + vm.margin.top + ")");

            vm.elements.axis.append("g")
                .attr("class", "axis axis--y");

            vm.elements.axis.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + vm.dimensions.h + ")");

            vm.elements.legend = vm.elements.svg.append("g").attr("class", "legend")
                .attr("transform", "translate(" + (vm.dimensions.w + 75) + "," + vm.margin.top + ")");
            
            vm.elements.legend.append("g").attr("class", "leg-bars");

            vm.elements.legend.append("g")
                .attr("transform", "translate(" + (vm.dimensions.lw) + ", 0)")
                .attr("class", "legend-axis legend-axis-y");

            // Enable zoom
            vm.zoom = d3.zoom().scaleExtent([1 / 2, 4]).on("zoom", vm.zoomed)
            vm.elements.plot.call(vm.zoom);
        }
    }
}