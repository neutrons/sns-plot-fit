import * as d3 from 'd3';

export const updateLabels = {
    methods: {
        updateLabels() {
            let vm = this;

            // Updated axis according to any new transformations
            // Add X Axis Label
            vm.elements.svg.select("#xLabel-" + vm.ID).html("`" + vm.labels.x + "`");
            vm.elements.svg.select("#yLabel-" + vm.ID).html("`" + vm.labels.y + "`");
            // vm.elements.svg.select("#plotTitle-" + vm.ID).html("`" + vm.labels.y + "` vs `" + vm.labels.x + "`");

            // Call MathJax to make plot axis labels look pretty 
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, ["xLabel-" + vm.ID, "yLabel-" + vm.ID]]);
        }
    }
}