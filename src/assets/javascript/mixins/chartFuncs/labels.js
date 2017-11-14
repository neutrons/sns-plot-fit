export const labels = {
    methods: {
        addLabels() {
            let vm = this;

            let L = vm.chart.svg.append('g');

            L.call((selection) => {
                for (let i = 0; i < 2; i++) {
                    let temp = selection.append(vm.isMathJax ? 'foreignObject' : 'text')
                        .attr('height', 100)
                        .attr('width', 200)
                        .attr('id', i%2 ? `yLabel-${vm.ID}` : `xLabel-${vm.ID}`)
                        .attr('transform', () => {
                            if (vm.isMathJax) {
                                return i%2 ? `translate(0, ${vm.dimensions.h/2}) rotate(-90)` : `translate( ${((vm.dimensions.w + vm.margin.left + vm.margin.right)/2)}, ${(vm.dimensions.h + vm.margin.bottom - 15)})`;
                            } else {
                                return i%2 ? `translate(20, ${vm.dimensions.h/2}) rotate(-90)` : `translate(${((vm.dimensions.w + vm.margin.left + vm.margin.right)/2)}, ${(vm.dimensions.h + vm.margin.bottom + 10)})`;
                            }
                        });
                    
                    if (vm.isMathJax) {
                        temp.html(i%2 ? `\`${vm.label.y}\`` : `\`${vm.label.x}\``);
                        
                        // Call MathJax to make plot axis labels look pretty 
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub, ["xLabel-" + vm.ID, "yLabel-" + vm.ID]]);
                    } else {
                        temp.text(i%2 ? vm.label.y : vm.label.x);
                    }
                }
            });
        },
        updateLabels() {
            let vm = this;

            // Updated axis according to any new transformations or field changes
            if (vm.isMathJax) {
                vm.chart.svg.select("#xLabel-" + vm.ID).html("`" + vm.label.x + "`");
                vm.chart.svg.select("#yLabel-" + vm.ID).html("`" + vm.label.y + "`");

                // Call MathJax to make plot axis labels look pretty 
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, ["xLabel-" + vm.ID, "yLabel-" + vm.ID]]);
            } else {
                vm.chart.svg.select("#xLabel-" + vm.ID).text(vm.label.x);
                vm.chart.svg.select("#yLabel-" + vm.ID).text(vm.label.y);
            }
        }
    }
}