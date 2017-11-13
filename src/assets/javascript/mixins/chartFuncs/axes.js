import * as d3 from 'd3';

export const axes = {
    methods: {
        initAxes() {
            let vm = this;

            vm.axis.x = d3.axisBottom(vm.scale.x).ticks(10);
            vm.axis.y = d3.axisLeft(vm.scale.y).ticks(10);
        },
        updateAxes(x = this.scale.x, y = this.scale.y, t = d3.transition().duration(0)) {
            let vm = this;

            vm.axis.x.scale(x);
            vm.axis.y.scale(y);
            
            vm.chart.g.select('.axis--x')
                .transition(t)
                .call(vm.axis.x);

            vm.chart.g.select('.axis--y')
                .transition(t)
                .call(vm.axis.y);            
        }
    }
}