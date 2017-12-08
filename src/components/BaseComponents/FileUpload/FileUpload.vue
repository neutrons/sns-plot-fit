<template>
  <div id='file-upload'>

    <label id='file-load-btn' class='btn btn-success navbar-btn'>
        Add Files 
        <input id='file-upload-input' type='file' style='display: none;' @change='validateFiles($event.target.files)' multiple>
    </label>

    <!-- File Drop Zone -->
    <v-dropzone
        @drag-files='validateFiles'
    ></v-dropzone>
  </div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If files are uploaded in 'fileUpload.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../../assets/javascript/eventBus';

/* Import Components */
import Dropzone from './Dropzone.vue';

export default {
    name: 'file-upload',
    components: {
        'v-dropzone': Dropzone,
    },
    data() {
        return {
            extensionMatch: ['TAS', 'SANS2D'],
        }
    },
    mounted() {
        
    },
    methods: {
        validateFiles(files) {
            let fileList = [];

            for (var i = 0, len = files.length; i < len; i++) {
                // loadFiles(files[i]);
                let url = files[i].name;
                let blob = files[i];
                
                let re = this.extensionMatch.indexOf(this.$route.name) > -1 ? /.dat/g : /.txt/g;
                let match = url.search(re);
                let filename = url.slice(0, match);

                if (match > 0) {
                    
                    fileList.push({
                        url,
                        blob,
                        filename,
                    })
                } else {
                    // error, don't read for now
                    let errorMsg = `<strong>Error! </strong> ${url} is not a supported type.<br/>Make sure the file ends in <em>${this.extensionMatch.indexOf(this.$route.name) > -1 ?  '.dat' : '.txt'}.</em>`
                    eventBus.$emit('error-message', errorMsg, 'danger');
                }
            }
            
            if (fileList.length > 0) {
                this.uploadFiles(fileList);
            }

            document.getElementById('file-upload-input').value = '';
        },
        uploadFiles(files) {
            // console.log(`Upload files for ${this.$route.name}`, files);

            let temp = {};

            files.forEach( el => {
                let fname = el.filename;

                el.tags = [];
                el.loadType = 'uploaded';
                
                temp[fname] = el;
            })

            if (Object.keys(temp).length > 0) {

                this.$store.commit('addFiles', 
                {
                    loadType: 'uploaded',
                    dataType: this.$route.name, 
                    files: temp
                });
            }

        },
    }
}
</script>

<style lang='less' scoped>
.btn {
  border-radius: 0px;
  margin-right: 10px;
}
</style>