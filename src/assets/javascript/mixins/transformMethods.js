export const transformMethods = {
    methods: {
        setTransformations(x,y) {
            // console.log("Setting transformations:", x, y);
            this.currentConfiguration.transformations.x = x;
            this.currentConfiguration.transformations.y = y;
        },
        resetTransformations() {
            let route = this.$route.name;
            let xt = this.$store.getters.getFitConfigsXTrans(route, this.currentConfiguration.fit);
            let yt = this.$store.getters.getFitConfigsYTrans(route, this.currentConfiguration.fit);
            
            this.currentConfiguration.transformations.x = xt;
            this.currentConfiguration.transformations.y = yt;
        },
    }
}