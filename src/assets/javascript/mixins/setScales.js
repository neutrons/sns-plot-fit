export const setScales = {
    methods: {
        setScales(type, value) {
            let vm = this;

            if (type === 'X') {
                this.scale.xType = value;
                this.scale.x = this.$store.getters.getXScaleByID(value);
            } else {
                this.scale.yType = value;
                this.scale.y = this.$store.getters.getYScaleByID(value);
            }

            vm.updateScales();
        },
        resetScales() {
            let vm = this;
            
            // Reset the selected options to default scales
            this.$refs.scale.$refs.y_select.value = 'Y';
            this.$refs.scale.$refs.x_select.value = 'X';

            this.scale.xType = 'X';
            this.scale.x = this.$store.getters.getXScaleByID('X');
            this.scale.yType = 'Y';
            this.scale.y = this.$store.getters.getYScaleByID('Y');

            vm.updateScales();
        },
        updateScales() {
            let vm = this;

            this.$nextTick( () => {
                if (vm.selectedData.length > 0)    vm.$refs['plot_' + vm.ID].updateScales(vm.scale);
            })
        }
    }
}