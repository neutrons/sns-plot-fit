import axios from 'axios';

export const emitpick = {
    methods: {
        emitpick() {
            let vm = this;
            // code to read file

            let url = this.fileList[this.picked];

            var temp = this.$store.getters.getSavedFile(this.id, url.filename);
                    
            // console.log("Here is the temp:", temp);
            if (temp !== '999') {
                this.callback(temp);
                return;
            }
            
            var promises = [url].map(function(url) {

                if (url.type === 'fetch') {
                    return axios.get(url.url).then(function(response) {
                        // console.log("axios response data", response);

                        let data = vm.parseData(response.data, url.filename);
                
                        vm.$store.commit('storeData', { filename: url.filename, data: data, dataType: vm.id});

                        return data;
                    });        
                } else if (url.type === 'upload') {

                    // Turn file reader into a promise in order to
                    // wait on the async reading of files with Promise.all below
                    return new Promise((resolve, reject) => {
                        var reader = new FileReader();
                        
                        reader.onload = function (e) {  
                            // Get file content
                            var content = e.target.result;

                            // Code to read Upload 2D file
                            let data = vm.parseData(content, url.filename);

                            vm.$store.commit('storeData', { filename: url.filename, data: data, dataType: vm.id});
                            
                            resolve(data);    
                        }
                        
                        reader.readAsText(url.url, "UTF-8");
                    });
                } else {
                    console.log("Sorry, uknown type.");
                }
            });

            if (promises.length > 0) {

                Promise.all(promises).then(results => {
                    
                    //vm.$emit('picked', results[0].data);
                    vm.callback(results[0]);

                }).catch(reason => { console.log(reason) });
            }
        },
    }
}