import * as d3 from 'd3';

export const color = {
    methods: {
        initColorScale() {
            let vm = this;

            // Set Color Scale
            // color domain is set in order for filenames to have
            // assigned colors. If this wasn't set and a filename
            // was unselected from the list, the plot would re-assign
            // color values to the plots causing confusion at first glance
            // reference: https://stackoverflow.com/questions/20590396/d3-scale-category10-not-behaving-as-expected
            vm.color = d3.scaleOrdinal(d3.schemeCategory20)
                .domain(vm.plotParameters.colorDomain);
        }
    }
}