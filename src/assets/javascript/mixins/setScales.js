export const setScales = {
    methods: {
        setScales(type, value) {
            let vm = this;

            if (type === 'X') {
                this.scales.xType = value;
                this.scales.x = this.$store.getters.getXScaleByID(value);
            } else {
                this.scales.yType = value;
                this.scales.y = this.$store.getters.getYScaleByID(value);
            }

            this.$nextTick(function() {
                if (vm.selectedData.length > 0)    vm.$refs['plot_' + vm.ID].updateScales(vm.scales);
            })
        },
        resetScales() {
            let vm = this;
            
            // Reset the selected options to default scales
            this.$refs.scales.$refs.y_select.value = 'Y';
            this.$refs.scales.$refs.x_select.value = 'X';

            this.scales.xType = 'X';
            this.scales.x = this.$store.getters.getXScaleByID('X');
            this.scales.yType = 'Y';
            this.scales.y = this.$store.getters.getYScaleByID('Y');

            this.$nextTick(function() {
                if (vm.selectedData.length > 0)    vm.$refs['plot_' + vm.ID].updateScales(vm.scales);
            })
        }
    }
}