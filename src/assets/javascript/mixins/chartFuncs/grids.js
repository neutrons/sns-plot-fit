import * as d3 from 'd3';

export const grids = {
    methods: {
        initGrids() {
            let vm = this;

            vm.grid.x = d3.axisBottom(vm.scale.x).ticks(10).tickSize(-vm.dimensions.h).tickFormat("");
            vm.grid.y = d3.axisLeft(vm.scale.y).ticks(10).tickSize(-vm.dimensions.w).tickFormat("");
        },
        updateGrids(x = this.scale.x, y = this.scale.y, t = d3.transition().duration(0)) {
            let vm = this;

            vm.grid.x.scale(x);
            vm.grid.y.scale(y);
            
            vm.chart.g.select('.grid--x')
                .transition(t)
                .call(vm.grid.x);

            vm.chart.g.select('.grid--y')
                .transition(t)
                .call(vm.grid.y);
          }
    }
}