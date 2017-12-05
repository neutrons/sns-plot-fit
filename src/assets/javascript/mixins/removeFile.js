export const removeFile = {
    methods: {
        removeFile(type, filename, callback = function() { return; }) {
            this.$store.commit('removeFile', {dataType: type, filename: filename});
            this.$store.commit('removeColor', {dataType: type, filename: filename});

            let index = this.filesToPlot.indexOf(filename);

            callback();

            if (index > -1) {
                this.filesToPlot.splice(index, 1);

                this.$nextTick(function() {
                    this.setFilesToPlot();
                });
            }
        }
    }
}