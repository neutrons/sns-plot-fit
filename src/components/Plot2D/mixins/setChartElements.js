import * as d3 from 'd3';

export const setChartElements = {
    methods: {
        setChartElements() {
            let vm = this;

            // Add tool tip and hide it until invoked
            vm.chart.tooltip = d3.select("#app-container").append("div")
                .attr("class", "tooltip-" + vm.ID)
                .style("opacity", 0);

            vm.chart.svg = d3.select("#chart-" + vm.ID).append("svg")
                .attr("viewBox", vm.dimensions.viewbox)
                .attr("perserveAspectRatio","xMidYMid meet")
                .attr('class', 'chart-' + vm.ID)
                .attr("width", vm.dimensions.w + vm.margin.left + vm.margin.right)
                .attr("height", vm.dimensions.h + vm.margin.top + vm.margin.bottom);
    
            //Add clip path so hexagons do not exceed boundaries
            vm.chart.svg.append("defs").append("clipPath")
                .attr("id", "clip-" + vm.ID)
                .append("rect")
                .attr("width", vm.dimensions.w)
                .attr("height", vm.dimensions.h);

            // Create plot elements (plot area, axis, and color legend)
            vm.chart.g = vm.chart.svg.append("g")
                .attr("class", "chart")
                .attr("transform", "translate(" + vm.margin.left + "," + vm.margin.top + ")");
                    
            vm.chart.g.append('g')
                .append('rect')
                .attr('class', 'zoom')
                .attr('width', vm.dimensions.w)
                .attr('height', vm.dimensions.h)
                .style('visibility', 'hidden');

            let chartArea = vm.chart.g.append("g").attr('class', 'chart-area')
                .attr("clip-path", "url(#clip-" + vm.ID + ")");

            chartArea.append('g').attr("class", "hexagon");            

            // Add axes
            let axes = vm.chart.g.append("g")
                .attr("id", "axis-" + vm.ID);

            axes.append("g")
                .attr("class", "axis axis--y");

            axes.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + vm.dimensions.h + ")");

            // Add legend
            let legend = vm.chart.svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + (vm.dimensions.w + 75) + "," + vm.margin.top + ")");
            
            legend.append("g")
                .attr("class", "leg-bars");

            legend.append("g")
                .attr("transform", "translate(" + (vm.dimensions.lw) + ", 0)")
                .attr("class", "legend-axis legend-axis-y");
        }
    }
}