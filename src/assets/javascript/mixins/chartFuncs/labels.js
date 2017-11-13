export const labels = {
    methods: {
        addLabels() {
            let vm = this;

            // If labels need rendering with mathjax
            if (vm.isMathJax) {
                // Add Y Axis Label
                vm.chart.svg.append("g").append("foreignObject")
                    .attr("height", 100)
                    .attr("width", 200)
                    .attr("transform", "translate(0," + (vm.dimensions.h/2) + ") rotate(-90)")
                    .attr("id", "yLabel-" + vm.ID)
                    .html("`" + vm.label.y + "`");

                // Add X Axis Label
                vm.chart.svg.append("g").append("foreignObject")
                    .attr("height", 100)
                    .attr("width", 200)
                    .attr("transform", "translate(" + ((vm.dimensions.w + vm.margin.left + vm.margin.right)/2) + "," + (vm.dimensions.h + vm.margin.bottom - 15) + ")")
                    .attr("id", "xLabel-" + vm.ID)
                    .html("`" + vm.label.x + "`");

                // Call MathJax to make plot axis labels look pretty 
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, ["xLabel-" + vm.ID, "yLabel-" + vm.ID]]);
            } else { // render normally
                // Add Y Axis Label
                vm.chart.svg.append("g").append("text")
                    .attr("height", 100)
                    .attr("width", 200)
                    .attr("transform", "translate(20," + (vm.dimensions.h/2) + ") rotate(-90)")
                    .attr("id", "yLabel-" + vm.ID)
                    .text(vm.label.y);

                // Add X Axis Label
                vm.chart.svg.append("g").append("text")
                    .attr("height", 100)
                    .attr("width", 200)
                    .attr("transform", "translate(" + ((vm.dimensions.w + vm.margin.left + vm.margin.right)/2) + "," + (vm.dimensions.h + vm.margin.bottom + 10) + ")")
                    .attr("id", "xLabel-" + vm.ID)
                    .text(vm.label.x);
            }
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