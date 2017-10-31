<template>
  <div id="plot-tas-col" class="col-md-10">

            <!-- Plot Panel  -->
            <v-panel PANELTITLE="TAS Plot" PANELTYPE="primary">
                <!-- Plot reset button inserted into panel heading  -->
                <v-reset-button :onClick="resetPlot" v-if="!DISABLE" slot="header-content">Reset Plot</v-reset-button>
                
                <div :id="'plot-' + ID"></div>

                <div class="metadata" v-if="METADATA">
                    <hr>
                    <h3>Metadata</h3>
                    <ul class="metadata-list">
                        <li v-for="m in METADATA">
                            {{m}}
                        </li>
                    </ul>
                </div>
            </v-panel>
  </div>
</template>

<script>
/* Import Event Bus */
import { eventBus } from '../../assets/javascript/eventBus';

/* Import Components */
import Panel from '../BaseComponents/Panels/Panel.vue';
import ResetButton from '../BaseComponents/ResetButton.vue';

/* Import Libraries */
import * as _ from 'lodash';
import * as d3 from 'd3';
import $ from 'jquery';

/* Import Common Data Variables */
import chartElements from '../../assets/javascript/mixins/chart/chartElements.js';

/* Import Mixins */
import { setResponsive } from '../../assets/javascript/mixins/chart/setResponsive.js';
import getContainerWidth from '../../assets/javascript/mixins/chart/getContainerWidth.js';
import getViewHeight from '../../assets/javascript/mixins/chart/getViewHeight.js';

export default {
    name: 'PlotTAS',
    components: {
        'v-panel': Panel,
        'v-reset-button': ResetButton
    },
    props: {
        DISABLE: {
            type: Boolean,
            default: true
        },
        METADATA: {
            type: Array
        }
    },
    data() {

        let tempData = _.cloneDeep(chartElements);

        // Extend onto chart elements' base data
        tempData.ID = 'TAS';
        tempData.fields = {x: null, y: null};

        return tempData;

    },
    computed: {
        isFit() {
            return this.plotParameters.fileToFit !== null && this.plotParameters.fitConfiguration.fit !== 'None';
        }
    },
    mounted() {
        eventBus.$on('swap-fields', this.swapFields);
    },
    mixins: [
        setResponsive
    ],
    methods: {
        drawPlot(parameters) {
            

            let vm = this;

            vm.plotParameters = _.cloneDeep(parameters);
            vm.plotData = _.cloneDeep(parameters.data.data);

            this.labels.y = parameters.labels.y;
            this.labels.x = parameters.labels.x;
            
            if (!d3.select('.chart-' + vm.ID).empty()) {

                // Assign fields if none were provided yet
                vm.initFields();

                this.plotData = this.plotData.map(function(el) {
                    return {x: el[vm.fields.x], y: el[vm.fields.y]};
                })

                vm.updatePlot();

                return;
            }

            vm.initDimensions();

            // Assign fields if none were provided yet
            vm.initFields();

            this.plotData = this.plotData.map(function(el) {
                return {x: el[vm.fields.x], y: el[vm.fields.y]};
            })

            vm.initScales();

            vm.setElements();

            // set responsive
            vm.setResponsive();

            vm.updatePlot();
        },
        updatePlot() {

            let vm = this;
    
            // Then adjust scale's domain whenver new data is added
            vm.adjustDomains();           
            
            // Transition axis and gridlines labels accordingly
            vm.elements.axis.transition().duration(750).select('.axis--y').call(vm.axis.y);
            vm.elements.axis.transition().duration(750).select('.axis--x').call(vm.axis.x);
            vm.elements.axis.transition().duration(750).select('.gridline--y').call(vm.axis.yGrid);
            vm.elements.axis.transition().duration(750).select('.gridline--x').call(vm.axis.xGrid);

            // Update all circles
            let scatterSelect = vm.elements.plot.selectAll("circle").data(vm.plotData);
            
            // Re-position points
            scatterSelect.transition().duration(750)
                .attr("cx", function(d) {
                    return vm.scale.x(d.x);
                })
                .attr("cy", function(d) {
                    return vm.scale.y(d.y);
                });

            // Enter new points
            scatterSelect.enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", function(d) {
                    return vm.scale.x(d.x);
                })
                .attr("cy", function(d) {
                    return vm.scale.y(d.y);
                })
                .attr("r", 4)
                .style("fill", function(d) {
                    return d.color = vm.color(d.name);
                });

            // Remove old
            scatterSelect.exit().remove();  
        },
        setElements() {
            let vm = this;

            // Set svg
            vm.elements.svg = d3.select('#plot-' + vm.ID).append('svg')
                .attr("viewBox", vm.dimensions.viewbox)
                .attr("perserveAspectRatio","xMidYMid meet")
                .attr('class', 'chart-' + vm.ID)
                .attr('width', vm.dimensions.w + vm.margin.left + vm.margin.right)
                .attr('height', vm.dimensions.h + vm.margin.top + vm.margin.bottom);
            
            // Set axes and gridlines
            vm.elements.axis = vm.elements.svg.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(' + vm.margin.left + ',' + vm.margin.top + ')');

            vm.elements.axis.append('g').attr('class', 'axis--y');
            vm.elements.axis.append('g').attr('class', 'axis--x').attr("transform", "translate(0," + vm.dimensions.h + ")");

            // X Gridlines
            vm.elements.axis.append("g")
                .attr("transform", "translate(0," + (vm.dimensions.h) + ")")
                .attr("class", "gridline gridline--x");

            // Y Gridlines
            vm.elements.axis.append("g").attr("class", "gridline gridline--y");
            
            // Set main plot group
            vm.elements.plot = vm.elements.svg.append('g')
                .attr('transform', 'translate(' + vm.margin.left + ',' + vm.margin.top + ')');

            vm.elements.plot.append('g').attr('id', '#scatter-' + vm.ID);
        },
        setData() {

        },
        initDimensions() {
            let vm = this;

            // Set plot dimensions
            var containerWidth = getContainerWidth(vm);
            var viewHeight = getViewHeight(vm, containerWidth);

            vm.dimensions.h = viewHeight - vm.margin.top - vm.margin.bottom;

            vm.dimensions.w = containerWidth - vm.margin.left - vm.margin.right;

            vm.dimensions.viewbox = "0 0 " + containerWidth + " " + viewHeight;
        },
        initScales() {
            let vm = this;

            // Set scales
            let xExtent = d3.extent(vm.plotData, function(d) { return d.x; });
            let yExtent = d3.extent(vm.plotData, function(d) { return d.y; });

            vm.scale.x = vm.plotParameters.scales.x;
            vm.scale.x.range([0,vm.dimensions.w]);
            vm.scale.x.domain(xExtent);
            
            vm.scale.y = vm.plotParameters.scales.y;
            vm.scale.y.range([vm.dimensions.h, 0]);
            vm.scale.y.domain(yExtent);

            this.scale.xType = vm.plotParameters.scales.xType;
            this.scale.yType = vm.plotParameters.scales.yType;

            // Set Axes
            vm.axis.x = d3.axisBottom(vm.scale.x).ticks(10);
            vm.axis.y = d3.axisLeft(vm.scale.y).ticks(10);
            vm.axis.xGrid = d3.axisBottom(vm.scale.x).ticks(10).tickSize(-vm.dimensions.h).tickFormat("");
            vm.axis.yGrid = d3.axisLeft(vm.scale.y).ticks(10).tickSize(-vm.dimensions.w).tickFormat("");

            // Set Color Scale
            vm.color = d3.scaleOrdinal(d3.schemeCategory20)
                .domain(vm.plotParameters.colorDomain);

        },
        adjustDomains() {
            let vm = this;

            // Set scales
            let xExtent = d3.extent(vm.plotData, function(d) { return d.x; });
            let yExtent = d3.extent(vm.plotData, function(d) { return d.y; });
            
            vm.scale.x.domain(xExtent).nice();
            vm.scale.y.domain(yExtent).nice();
        },
        initFields() {
            let vm = this;

            this.fields.x = this.plotParameters.fields.x;
            this.fields.y = this.plotParameters.fields.y;

            // Assign fields if none were provided yet
            if (this.fields.x === null || this.fields.y === null) {
                [this.fields.x, this.fields.y] = this.getFields();
            }

            // console.log("FIELDS:", this.fields);
        },
        getFields() {
            
            let keys = Object.keys(this.plotData[0]);
            keys.sort();
            // console.log("KEYS", keys);
            let tx = keys[0];
            let ty = keys[0];

            return [tx, ty];
        },
        swapFields() {
            console.log("Swap fields");
            let vm = this;

            [vm.fields.x, vm.fields.y] = [vm.fields.y, vm.fields.x];

            vm.plotData = _.cloneDeep(vm.plotParameters.data.data);

            vm.plotData = vm.plotData.map(function(el) {
                return {x: el[vm.fields.x], y: el[vm.fields.y]};
            })

            vm.updatePlot();
        }
    },
    created() {},
    watch: {
        plotParameters: {
            handler() {
                // let vm = this;

                // this.$nextTick(function() { 
                //     this.drawPlot();
                // });
            },
            deep: true
        }
    }
}
</script>

<style lang="less" scoped>
@import '../../assets/styles/plot-TAS-styles.css';

.metadata {
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    margin: auto;

    .metadata-list {
        -webkit-column-count: 3; /* Chrome, Safari, Opera */
        -moz-column-count: 3; /* Firefox */
        column-count: 3;

        word-wrap: break-word;
    }
}
</style>