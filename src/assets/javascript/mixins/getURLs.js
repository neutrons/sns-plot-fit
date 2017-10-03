// Mixin for Stitch and 1D to get URLs, since the components use the same data
export const getURLs = {
    methods: {
        getURLs(files, label) {

            var tempURLs = [], fetchList = [], uploadList = [];

            for(let i = 0, len = files.length; i < len; i++) {
                var inFetch = document.getElementById(files[i] + label);

                if(inFetch) {
                    // console.log("In fetch:", inFetch);
                    fetchList.push(files[i]);
                } else {
                    // console.log("No in fetch:", inFetch);
                    uploadList.push(files[i]);
                }
            }

            // console.log("Here is the FetchList", fetchList);
            if(fetchList.length > 0)
                tempURLs.push(this.$store.getters.get1DURL('fetch', fetchList))

            // console.log("Here is the UploadList", uploadList);
            if(uploadList.length > 0)
                tempURLs.push(this.$store.getters.get1DURL('upload', uploadList))
            
            // Flatten out array so it isn't nested
            tempURLs = _.flatten(tempURLs);

            // console.log("Here are the tempURLs", tempURLs);
            return tempURLs;
        }
    }
}