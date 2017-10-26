import * as d3 from 'd3';

export const updateBrushScale = {
    methods: {
        updateBrushScale() {
            let vm = this;

            let t = d3.zoomTransform( vm.elements.zoom.select('.zoom').node()); 
            let new_xScale = t.rescaleX(vm.scale.x);
            
            // Update brush scale
            vm.scale.brushX = new_xScale.copy();
        }
    }
}