import * as d3 from 'd3';

export const setElements = {
    methods: {
        setElements() {
            let vm = this;

            vm.elements.svg = d3.select("#plot-2D").append("svg")
            .attr("viewBox", vm.dimensions.viewbox)
            .attr("perserveAspectRatio","xMidYMid meet")
            .attr('class', 'chart-2D')
            .attr("width", vm.dimensions.w + vm.margin.left + vm.margin.right)
            .attr("height", vm.dimensions.h + vm.margin.top + vm.margin.bottom);
    
            //Add clip path so hexagons do not exceed boundaries
            vm.elements.svg.append("defs").append("clipPath")
                .attr("id", "clip-2D")
                .append("rect")
                .attr("width", vm.dimensions.w)
                .attr("height", vm.dimensions.h);

            // Create plot elements (plot area, axis, and color legend)
            vm.elements.plot = vm.elements.svg.append("g").attr("class", "plot")
                .attr("clip-path", "url(#clip-2D)")
                .attr("transform", "translate(" + vm.margin.left + "," + vm.margin.top + ")");
                    
            vm.elements.plot.append("g").attr("class", "hexagon");

            vm.elements.axis = vm.elements.svg.append("g").attr("id", "axis-2D")
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

            // Add X Axis Label
            vm.elements.svg.append("g").append("foreignObject")
            .attr("transform", "translate(" + ((vm.dimensions.w + vm.margin.left+vm.margin.right)/2) + "," + (vm.dimensions.h + vm.margin.top + vm.margin.bottom/1.5) + ")")
            .attr("id", "xLabel-2D")
            .html("`Qx`");

            // Add Y Axis Label
            vm.elements.svg.append("g").append("foreignObject")
                .attr("transform", "translate(0," + (vm.dimensions.h / 2) + ") rotate(-90)")
                .attr("id", "yLabel-2D")
                .html("`Qy`");

            // Enable zoom
            vm. zoom = d3.zoom().scaleExtent([1 / 2, 4]).on("zoom", vm.zoomed)
            vm.elements.svg.call(vm.zoom);

            // Call MathJax to make plot axis labels look pretty
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, ["xLabel-2D", "yLabel-2D"]]);
        }
    }
}