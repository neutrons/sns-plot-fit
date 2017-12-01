import * as d3 from 'd3';

export const setChartElements = {
    methods: {
        setChartElements() {
            let vm = this;

            // Add a line path function
            vm.updateLineGenerator(vm.scale.x, vm.scale.y);

            // Add tool tip and hide it until invoked
            vm.chart.tooltip = d3.select('#app-container').append('div')
                .attr('id', 'tooltip-' + vm.ID)
                .attr('class', 'tooltip')
                .style('opacity', 0);

            // Add main chart area
            vm.chart.svg = vm.addSVG();
            
            // Add clip path so points/line do not exceed chart boundaries
            vm.addClipPath();

            // Add chart area
            vm.chart.g = vm.chart.svg.append('g')
                .attr('transform', 'translate(' + [vm.margin.left, vm.margin.top] + ')');

            vm.chart.g.append('rect')
                .attr('class', 'chartbg')
                .attr('width', vm.dimensions.w)
                .attr('height', vm.dimensions.h);

            // Add Grid Group
            vm.chart.g.append('g').attr('id', 'grid-' + vm.ID)

            // X Grid
            vm.chart.g.select('#grid-' + vm.ID)
                .append('g')
                .attr('transform', 'translate(0,' + (vm.dimensions.h) + ')')
                .attr('class', 'grid grid--x');

            // Y Grid
            vm.chart.g.select('#grid-' + vm.ID)
                .append('g')
                .attr('class', 'grid grid--y');

            // Add Axis group
            vm.chart.g.append('g').attr('id', 'axis-' + vm.ID);

            // Add X Axis
            vm.chart.g.select('#axis-' + vm.ID)
                .append('g')
                .attr('transform', 'translate(0,' + (vm.dimensions.h) + ')')
                .attr('class', 'axis axis--x');

            // Add Y Axis
            vm.chart.g.select('#axis-' + vm.ID)
                .append('g')
                .attr('class', 'axis axis--y');

            // Add Legend Group
            vm.chart.g.append('g').attr('id', 'legend-' + vm.ID);

            // Add Zoom Group
            vm.chart.g.append('g')
                .attr('id', 'zoom-group-' + vm.ID)
                .append('g')
                    .attr('id', 'zoom-' + vm.ID)
                    .append('rect')
                    .attr('class', 'zoom')
                    .attr('width', vm.dimensions.w)
                    .attr('height', vm.dimensions.h);

            // Add Chart Element Group
            let chartElms = vm.chart.g.append('g')
                .attr('clip-path', 'url(#clip-' + vm.ID + ')')
                .attr('class', 'chart-elements');

            chartElms.append('g')
                .attr('id', 'line-' + vm.ID)

            // Add Scatter Group
            chartElms.append('g')
                .attr('id', 'scatter-' + vm.ID)

        }
    }
}