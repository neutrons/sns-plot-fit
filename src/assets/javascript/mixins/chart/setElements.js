import * as d3 from 'd3';
import setLineGenerator from './setLineGenerator.js';

export const setElements = {
    methods: {
        setElements() {
            let vm = this;

            //Add a Line Plot Function
            setLineGenerator(vm, vm.scale.x, vm.scale.y);

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
            vm.elements.g = vm.elements.svg.append('g').attr('transform', 'translate(' + vm.margin.left + ',' + vm.margin.top + ')');

            vm.elements.g.append("rect")
                .attr("class", "plotbg")
                .attr("width", vm.dimensions.w)
                .attr("height", vm.dimensions.h);

            // Add Axis and Gridline section
            vm.elements.axis = vm.elements.g.append("g").attr("id", "axis-" + vm.ID);

            vm.elements.zoom = vm.elements.g.append('g').attr('id', 'zoom-group-' + vm.ID);

            vm.elements.zoom.append('g')
                .attr("id", "zoom-" + vm.ID)
                .append('rect')
                .attr('class', 'zoom')
                .attr('width', vm.dimensions.w)
                .attr('height', vm.dimensions.h);
            
            //Add Group to Plot Line/Points
            vm.elements.plot = vm.elements.g.append("g")
                .attr("clip-path", "url(#clip-" + vm.ID + ")")
                .attr("class", "chart");

            // X Gridlines
            vm.elements.axis.append("g")
                .attr("transform", "translate(0," + (vm.dimensions.h) + ")")
                .attr("class", "gridline gridline--x");

            // Y Gridlines
            vm.elements.axis.append("g").attr("class", "gridline gridline--y");

            // Add X Axis
            vm.elements.axis.append("g")
                .attr("transform", "translate(0," + (vm.dimensions.h) + ")")
                .attr("class", "axis axis--x");

            // Add Y Axis
            vm.elements.axis.append("g").attr("class", "axis axis--y");

            // Add the Legend
            vm.elements.legend = vm.elements.plot.append("g").attr("id", "legend-" + vm.ID);
        }
    }
}