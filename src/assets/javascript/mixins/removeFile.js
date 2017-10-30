export const removeFile = {
    methods: {
        removeFile(type, filename, callback) {
            let vm = this;

            callback = callback || function() { return; };

            let index = vm.filesToPlot.indexOf(filename);

            if (index > -1) vm.filesToPlot.splice(index,1);

            callback();

            vm.$store.commit('removeFile', {dataType: type, filename: filename});
            vm.$store.commit('removeColor', {dataType: type, filename: filename});
        }
    }
}