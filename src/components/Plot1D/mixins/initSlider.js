import * as d3 from 'd3';

export const initSlider = {
    methods: {
        initSlider() {
            let vm = this;

            vm.margin2 = {
                top: 30,
                right: 50,
                bottom: 50,
                left: 75
            };

            vm.dimensions.h2 = 25;

            // Set scales
            vm.scale.x2 = vm.plotParameters.scales.xScale;

            vm.scale.x2.range([0,vm.dimensions.w]);
            vm.scale.x2.domain(d3.extent(vm.plotData, function (d) {
                return d.x;
            }));

            vm.axis.x2 = d3.axisBottom(vm.scale.x2);
    
            vm.elements.slider = vm.elements.svg.append("g")
                .attr("class", "slider")
                .attr("transform", "translate(" + vm.margin2.left + "," + (vm.dimensions.h + vm.margin2.top + vm.margin2.bottom) + ")");
    
            vm.brushObj.brush = d3.brushX()
                .extent([
                    [0, 0],
                    [vm.dimensions.w, vm.dimensions.h2]
                ]);
    
            // append scatter plot to brush chart area
            vm.elements.slider.append("g").attr("id", "slider-lines")
    
            vm.elements.slider.append("g")
                .attr("class", "brush")
            
            vm.elements.slider.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + vm.dimensions.h2 + ")");
        }
    }
}