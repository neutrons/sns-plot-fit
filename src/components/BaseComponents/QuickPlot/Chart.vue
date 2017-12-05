<template>
<div class='quick-chart'>
  <div :id='"quick-chart-" + id'></div>
</div>
</template>

<script>
import * as d3 from 'd3';
import _ from 'lodash';

import { linePath } from '../../../assets/javascript/mixins/chartFuncs/linePath.js';
import { scatter } from '../../../assets/javascript/mixins/chartFuncs/scatter.js';

export default {
    name: 'QuickChart',
    props: {
        data: {
            type: Array,
        }
    },
    mixins: [
        linePath,
        scatter,
    ],
    data() {
        return {
            margin: {top:5, right:25, bottom:25, left:50},
            height: 600,
            width: 960,
            svg: undefined,
            g: undefined,
            xScale: d3.scaleLinear(),
            yScale: d3.scaleLinear(),
            line: d3.line().curve(d3.curveMonotoneX),
        };
    },
    created: function () {
        window.addEventListener('resize', this.onResize);
    },
    beforeDestroy: function () {
        window.removeEventListener('resize', this.onResize);
    },
    mounted() {
        // Set Dimensions
        this.setDimensions();
        
        this.svg = d3.select(`#quick-chart-${this.id}`).append('svg')
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .attr('width', this.width + this.margin.left + this.margin.right);
        
        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
        let grid = this.g.append('g').attr('class', 'grid');

        grid.append('g').attr('class', 'grid--x')
            .attr('transform', `translate(0,${this.height})`);
        
        grid.append('g').attr('class', 'grid--y');

        let axis = this.g.append('g').attr('class', 'axis');
        
        axis.append('g').attr('class', 'axis--x')
            .attr('transform', `translate(0,${this.height})`);
        
        axis.append('g').attr('class', 'axis--y');
        
        this.g.append('g').attr('class', 'scatter-line');
        this.g.append('g').attr('class', 'scatter');
    },
    computed: {
        id() {
            return this.$route.name;
        },
        xAxis() {
            return d3.axisBottom(this.xScale);
        },
        yAxis() {
            return d3.axisLeft(this.yScale);
        },
        xGrid() {
            return d3.axisBottom(this.xScale).tickSize(-this.height).tickFormat("");;
        },
        yGrid() {
            return d3.axisLeft(this.yScale).tickSize(-this.width).tickFormat("");;
        },
    },
    methods: {
        onResize: _.debounce(function () {
            // Update Dimensions
            this.setDimensions();
            
            this.svg
                .attr('height', this.height + this.margin.top + this.margin.bottom)
                .attr('width', this.width + this.margin.left + this.margin.right);
            
            this.draw(this.data);
        }, 200),
        setDimensions() {
            let containerWidth = document.getElementById(`quick-chart-${this.id}`).offsetWidth;
            let viewHeight = containerWidth / (16/9);
            
            this.width = containerWidth - this.margin.right - this.margin.left;
            this.height = viewHeight - this.margin.top - this.margin.bottom;
        },
        draw(choice) {
            // Set domains
            this.adjustDomains(choice);
            
            // Add/Update Chart Elements
            this.$nextTick(() => {
                this.updateAxes();
                this.updateGrids();
                this.updateScatterLine(choice);
                this.updateScatter(choice);
            })
        },
        adjustDomains(choice) {
            this.xScale.range([0, this.width])
                .domain(d3.extent(choice, (d) => { return d.x }));
            
            this.yScale.range([this.height, 0])
                .domain(d3.extent(choice, (d) => { return d.y }));
            
            this.line
                .x((d) => { return this.xScale(d.x) })
                .y((d) => { return this.yScale(d.y) });
            
            let yMin = d3.min(choice, (d) => { return d.y; });
        },
        updateAxes(choice) {
            
            this.g.select('.axis--x')
                .transition()
                .duration(750)
                .attr('transform', `translate(0,${this.height})`)
                .call(this.xAxis);

            this.g.select('.axis--y')
                .transition()
                .duration(750)
                .call(this.yAxis);      
        },
        updateGrids(choice) {
            this.g.select('.grid--x')
                .transition()
                .duration(750)
                .attr('transform', `translate(0,${this.height})`)
                .call(this.xGrid);

            this.g.select('.grid--y')
                .transition()
                .duration(750)
                .call(this.yGrid);  
        },
        updateScatterLine(choice) {
            let scatterLine = this.g.select('.scatter-line')
                .selectAll('path')
                .data([choice]);
            
            scatterLine.transition().duration(750)
                .attr('d', this.line);
            
            // ENTER
            scatterLine.enter()
                .append('path')
                .attr('d', this.line)
                .style('fill', 'none')
                .style('stroke', 'green')
                .style('stroke-width', '2px');
        },
        updateScatter(choice) {
            let scatterSelect = this.g.select('.scatter')
                .selectAll('circle')
                .data(choice);

            // EXIT
            scatterSelect.exit().remove();
            
            // UPDATE
            scatterSelect
                .transition().duration(750)
                .attr('cx', (d) => { return this.xScale(d.x) })
                .attr('cy', (d) => { return this.yScale(d.y) });
            
            // ENTER
            scatterSelect.enter()
                .append('circle')
                .attr('cx', (d) => { return this.xScale(d.x) })
                .attr('cy', (d) => { return this.yScale(d.y) })
                .attr('r', 4)
                .style('fill', 'white')
                .style('stroke', 'green');
        },
    },
    watch: {
        data() {
            this.draw(this.data);
        }
    }
};
</script>

<style lang='less' scoped>
</style>