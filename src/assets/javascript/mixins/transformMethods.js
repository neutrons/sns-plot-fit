import fd from './fittings/fitData';

export const transformMethods = {
    methods: {
        setTransformations(x,y) {
            // console.log("Setting transformations:", x, y);
            this.currentConfiguration.transformations.x = x;
            this.currentConfiguration.transformations.y = y;

            this.selectedData.forEach( el => {
                el.dataTransformed = fd.transformData(el.data, this.currentConfiguration.transformations, this.field);
            });

            this.setParameters();
        },
        resetTransformations() {
            let route = this.$route.name;
            let xt = this.$store.getters.getFitConfigsXTrans(route, this.currentConfiguration.fit);
            let yt = this.$store.getters.getFitConfigsYTrans(route, this.currentConfiguration.fit);
            
            this.currentConfiguration.transformations.x = xt;
            this.currentConfiguration.transformations.y = yt;

            this.selectedData.forEach( el => {
                el.dataTransformed = fd.transformData(el.data, this.currentConfiguration.transformations, this.field);
            });

            this.setParameters();
        },
    }
}