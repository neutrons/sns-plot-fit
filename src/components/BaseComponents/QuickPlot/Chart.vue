<template>
<div class='quick-chart'>
    <button class='btn btn-success btn-xs quickplot-reset' @click='resetChart'>Reset Chart</button>
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
            xAxis: undefined,
            yAxis: undefined,
            xGrid: undefined,
            yGrid: undefined,
            zoom: d3.zoom().on('zoom', this.zoomed),
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

        // make a clip path
        this.svg.append('defs').append('clipPath')
            .attr('id', 'quickPlotClip')
            .append('rect')
            .attr('class', 'clip-rect')
            .attr('width', this.width)
            .attr('height', this.height);
        
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
        
        this.g.append('g').attr('class', 'scatter-error-line').attr('clip-path', 'url(#quickPlotClip)');
        this.g.append('g').attr('class', 'scatter-error-top').attr('clip-path', 'url(#quickPlotClip)');
        this.g.append('g').attr('class', 'scatter-error-bottom').attr('clip-path', 'url(#quickPlotClip)');
        this.g.append('g').attr('class', 'scatter-line').attr('clip-path', 'url(#quickPlotClip)');
        this.g.append('g').attr('class', 'scatter').attr('clip-path', 'url(#quickPlotClip)');

        let zoomWindow = this.g.append('rect')
            .attr('class', 'zoom-window')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('opacity', 0)
            .style('cursor', 'move')
            .style('pointer-events', 'all')
            .call(this.zoom);
    },
    computed: {
        id() {
            return this.$route.name;
        },
    },
    methods: {
        onResize: _.debounce(function () {
            // Update Dimensions
            this.setDimensions();
            
            this.svg
                .attr('height', this.height + this.margin.top + this.margin.bottom)
                .attr('width', this.width + this.margin.left + this.margin.right);

            this.svg.select('.clip-rect')
                .attr('height', this.height)
                .attr('width', this.width);

            this.g.select('.zoom-window')
                .attr('height', this.height)
                .attr('width', this.width);
            
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

            // Then rescale to zoom's scale
            let t = d3.zoomTransform( this.g.select('.zoom-window').node());
            let new_xScale = t.rescaleX(this.xScale); 
            let new_yScale = t.rescaleY(this.yScale);

            this.initAxes(new_xScale, new_yScale);
            this.initGrids(new_xScale, new_yScale);
            this.updateLine(new_xScale, new_yScale);
            
            // Add/Update Chart Elements
            this.$nextTick(() => {
                this.updateAxes();
                this.updateGrids();
                this.updateScatterLine(choice, new_xScale, new_yScale);
                this.updateScatter(choice, new_xScale, new_yScale);
                this.updateErrorLine(choice, new_xScale, new_yScale);
                this.updateErrorTop(choice, new_xScale, new_yScale);
                this.updateErrorBottom(choice, new_xScale, new_yScale);
            })
        },
        adjustDomains(choice) {
            this.xScale.range([0, this.width])
                .domain(d3.extent(choice, (d) => { return d.x }));

            this.yScale.range([this.height, 0])
                .domain(d3.extent(choice, (d) => { return d.y; }));
        },
        updateLine(x = this.xScale, y = this.yScale) {
            this.line = d3.line()
                .x((d) => { return x(d.x); })
                .y((d) => { return y(d.y); });
        },
        initAxes(x = this.xScale, y = this.yScale) {
            this.xAxis = d3.axisBottom(x);
            this.yAxis = d3.axisLeft(y);
        },
        updateAxes() {
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
        initGrids(x = this.xScale, y = this.yScale) {
            this.xGrid = d3.axisBottom(x).tickSize(-this.height).tickFormat('');
            this.yGrid = d3.axisLeft(y).tickSize(-this.width).tickFormat('');
        },
        updateGrids() {
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
        updateScatterLine(choice, x = this.xScale, y = this.yScale) {
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
                .style('stroke-width', '1.5px');
        },
        updateScatter(choice, x = this.xScale, y = this.yScale) {
            let scatterSelect = this.g.select('.scatter')
                .selectAll('circle')
                .data(choice);

            // EXIT
            scatterSelect.exit().remove();
            
            // UPDATE
            scatterSelect
                .transition().duration(750)
                .attr('cx', (d) => { return x(d.x) })
                .attr('cy', (d) => { return y(d.y) });
            
            // ENTER
            scatterSelect.enter()
                .append('circle')
                .attr('cx', (d) => { return x(d.x) })
                .attr('cy', (d) => { return y(d.y) })
                .attr('r', 3)
                .style('fill', 'white')
                .style('stroke', 'green');
        },
        updateErrorLine(choice, x = this.xScale, y = this.yScale) {
            let errorSelect = this.g.select('.scatter-error-line')
                .selectAll('line')
                .data(choice);

            // EXIT
            errorSelect.exit().remove();

            // UPDATE
            errorSelect.transition().duration(750)
                .attr('x1', (d) => { return x(d.x)})
                .attr('x2', (d) => { return x(d.x)})
                .attr('y1', (d) => { return y(d.y + d.error)})
                .attr('y2', (d) => { return y(d.y - d.error)});

            // ENTER
            errorSelect.enter()
                .append('line')
                .attr('x1', (d) => { return x(d.x)})
                .attr('x2', (d) => { return x(d.x)})
                .attr('y1', (d) => { return y(d.y + d.error)})
                .attr('y2', (d) => { return y(d.y - d.error)})
                .style('stroke', 'brown')
                .style('stroke-width', '1px');
        },
        updateErrorTop(choice, x = this.xScale, y = this.yScale) {
            let errorSelect = this.g.select('.scatter-error-top')
                .selectAll('line')
                .data(choice);

            // EXIT
            errorSelect.exit().remove();

            // UPDATE
            errorSelect.transition().duration(750)
                .attr('x1', (d) => { return x(d.x) - 4})
                .attr('x2', (d) => { return x(d.x) + 4})
                .attr('y1', (d) => { return y(d.y + d.error);})
                .attr('y2', (d) => { return y(d.y + d.error);});

            // ENTER
            errorSelect.enter().append('line')
                .attr('x1', (d) => { return x(d.x) - 4})
                .attr('x2', (d) => { return x(d.x) + 4})
                .attr('y1', (d) => { return y(d.y + d.error);})
                .attr('y2', (d) => { return y(d.y + d.error);})
                .style('stroke', 'brown')
                .style('stroke-width', '1px');
        },
        updateErrorBottom(choice, x = this.xScale, y = this.yScale) {
            let errorSelect = this.g.select('.scatter-error-bottom')
                .selectAll('line')
                .data(choice);

            // EXIT
            errorSelect.exit().remove();

            // UPDATE
            errorSelect.transition().duration(750)
                .attr('x1', (d) => { return x(d.x) - 4})
                .attr('x2', (d) => { return x(d.x) + 4})
                .attr('y1', (d) => { return y(d.y - d.error);})
                .attr('y2', (d) => { return y(d.y - d.error);});

            // ENTER
            errorSelect.enter().append('line')
                .attr('x1', (d) => { return x(d.x) - 4})
                .attr('x2', (d) => { return x(d.x) + 4})
                .attr('y1', (d) => { return y(d.y - d.error);})
                .attr('y2', (d) => { return y(d.y - d.error);})
                .style('stroke', 'brown')
                .style('stroke-width', '1px');
        },
        zoomed() {
            // UPDATE Scales
            let new_yScale = d3.event.transform.rescaleY(this.yScale);
            let new_xScale = d3.event.transform.rescaleX(this.xScale);
            
            // UPDATE axes
            this.g.select('.axis--y')
                .call(this.yAxis.scale(new_yScale));

            this.g.select('.axis--x')
                .call(this.xAxis.scale(new_xScale));

            // UPDATE grids
            this.g.select('.grid--y')
                .call(this.yGrid.scale(new_yScale));

            this.g.select('.grid--x')
                .call(this.xGrid.scale(new_xScale));

            // UPDATE line
            let plotLine = d3.line()
                .x(function (d) {
                    return new_xScale(d.x);
                })
                .y(function (d) {
                    return new_yScale(d.y);
                });

            this.g.select('.scatter-line').selectAll('path').attr('d', plotLine);

            // UPDATE error line
            this.g.select('.scatter-error-line')
                .selectAll('line')
                .attr('x1', (d) => { return new_xScale(d.x)})
                .attr('x2', (d) => { return new_xScale(d.x)})
                .attr('y1', (d) => { return new_yScale(d.y + d.error)})
                .attr('y2', (d) => { return new_yScale(d.y - d.error)});

            // UPDATE error top
            this.g.select('.scatter-error-top')
                .selectAll('line')
                .attr('x1', (d) => { return new_xScale(d.x) - 4})
                .attr('x2', (d) => { return new_xScale(d.x) + 4})
                .attr('y1', (d) => { return new_yScale(d.y + d.error);})
                .attr('y2', (d) => { return new_yScale(d.y + d.error);});

            // UPDATE error top
            this.g.select('.scatter-error-bottom')
                .selectAll('line')
                .attr('x1', (d) => { return new_xScale(d.x) - 4})
                .attr('x2', (d) => { return new_xScale(d.x) + 4})
                .attr('y1', (d) => { return new_yScale(d.y - d.error);})
                .attr('y2', (d) => { return new_yScale(d.y - d.error);});
            
            // UPDATE scatter
            this.g.selectAll('circle')
                .attr('cx', function(d) {
                    return new_xScale(d.x);
                })
                .attr('cy', function(d) {
                    return new_yScale(d.y);
                });

        },
        resetChart() {
            this.g.select('.zoom-window')
                .transition()
                .duration(750)
                .call(this.zoom.transform, d3.zoomIdentity);
        }
    },
    watch: {
        data() {
            this.draw(this.data);
        }
    }
};
</script>

<style lang='less' scoped>
.quickplot-reset {
    position: absolute;
    top: 35px;
    right: 45px;
}
</style>