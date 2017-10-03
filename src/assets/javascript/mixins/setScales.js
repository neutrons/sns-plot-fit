export const setScales = {
    methods: {
        setScales(type, value) {
            if(type === 'X') {
                        this.scales.xScaleType = value;
                        this.scales.xScale = this.$store.getters.getXScaleByID(value);
            } else {
                this.scales.yScaleType = value;
                this.scales.yScale = this.$store.getters.getYScaleByID(value);
            }
        },
        resetScales() {
            
            // Reset the selected options to default scales
            this.$refs.scales.$refs.y_select.value = 'Y';
            this.$refs.scales.$refs.x_select.value = 'X';

            this.scales.xScaleType = 'X';
            this.scales.xScale = this.$store.getters.getXScaleByID('X');
            this.scales.yScaleType = 'Y';
            this.scales.yScale = this.$store.getters.getYScaleByID('Y');
        }
    }
}