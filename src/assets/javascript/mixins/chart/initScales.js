import * as d3 from 'd3';
import extent from './extent.js';

export const initScales = {
    methods: {
        initScales() {
            let vm = this;

            // Set scales
            let xExtent = extent(vm.dataNest, 'x');
            let yExtent = extent(vm.dataNest, 'y');

            vm.scale.x = vm.plotParameters.scales.x;
            vm.scale.x.range([0,vm.dimensions.w]);
            vm.scale.x.domain(xExtent);
            
            vm.scale.y = vm.plotParameters.scales.y;
            vm.scale.yType = vm.plotParameters.scales.yType;
            vm.scale.y.range([vm.dimensions.h, 0]);
            vm.scale.y.domain(yExtent);

            // Set Axes
            vm.axis.x = d3.axisBottom(vm.scale.x).ticks(10);
            vm.axis.y = d3.axisLeft(vm.scale.y).ticks(10);
            vm.axis.xGrid = d3.axisBottom(vm.scale.x).ticks(10).tickSize(-vm.dimensions.h).tickFormat("");
            vm.axis.yGrid = d3.axisLeft(vm.scale.y).ticks(10).tickSize(-vm.dimensions.w).tickFormat("");

            // Set Color Scale
            // color domain is set in order for filenames to have
            // assigned colors. If this wasn't set and a filename
            // was unselected from the list, the plot would re-assign
            // color values to the plots causing confusion at first glance
            // reference: https://stackoverflow.com/questions/20590396/d3-scale-category10-not-behaving-as-expected
            vm.color = d3.scaleOrdinal(d3.schemeCategory20)
                .domain(vm.plotParameters.colorDomain);
            }
    }
}