import * as d3 from 'd3';

export const updateLabels = {
    methods: {
        updateLabels() {
            let vm = this;

            // Updated axis according to any new transformations or field changes
            if (vm.isMathJax) {
                vm.elements.svg.select("#xLabel-" + vm.ID).html("`" + vm.labels.x + "`");
                vm.elements.svg.select("#yLabel-" + vm.ID).html("`" + vm.labels.y + "`");

                // Call MathJax to make plot axis labels look pretty 
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, ["xLabel-" + vm.ID, "yLabel-" + vm.ID]]);
            } else {
                vm.elements.svg.select("#xLabel-" + vm.ID).text(vm.labels.x);
                vm.elements.svg.select("#yLabel-" + vm.ID).text(vm.labels.y);
            }
        }
    }
}