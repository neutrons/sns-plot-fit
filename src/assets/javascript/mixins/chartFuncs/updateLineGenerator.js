import * as d3 from 'd3';

export const updateLineGenerator = {
    methods: {
        updateLineGenerator(x, y) {
            let vm = this;

            vm.line = d3.line()
                .defined(function(d) { 
                    if(vm.scale.yType === 'Log(Y)') {
                        return d.y > 0;
                    } else {
                        return d;
                    }
                })
                .x(function (d) {
                    return x(d.x);
                })
                .y(function (d) {
                    return y(d.y);
                });
        }
    }
}