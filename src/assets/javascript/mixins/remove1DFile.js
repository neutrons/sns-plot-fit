export const remove1DFile = {
    methods: {
        remove1DFile(filename, callback) {
            let vm = this;

            callback = callback || function() { return; };

            let index = vm.filesToPlot.indexOf(filename);

            if (index > -1) vm.filesToPlot.splice(index,1);
            callback();

            vm.$store.commit('remove1DFile', filename);
            vm.$store.commit('removeColor', filename);
        }
    }
}