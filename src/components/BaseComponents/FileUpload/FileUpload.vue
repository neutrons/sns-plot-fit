<template>
  <div id="file-upload">

    <button class="btn btn-success navbar-btn" @click="loadPopup"><i class="fa fa-file" aria-hidden="true"></i> Load Files</button>

    <!-- File Drop Zone -->
    <v-dropzone
        @drag-files="dragFiles"
    ></v-dropzone>

    <!-- Modal Upload Form -->
    <v-upload-form 
        ref="upload_form"
    ></v-upload-form>

  </div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If files are uploaded in 'fileUpload.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../../assets/javascript/eventBus';

import Dropzone from './Dropzone.vue';
import UploadForm from './UploadForm.vue';

export default {
    name: 'file-upload',
    components: {
        'v-dropzone': Dropzone,
        'v-upload-form': UploadForm,
    },
    data() {
        return {
            
        }
    },
    mounted() {
        
    },
    methods: {
        loadPopup() {
            let vm = this;

            // console.log("Removing point: ", index, name);
            $("#file-upload-form").modal('show')
    
        },
        dragFiles(files) {
            this.$refs.upload_form.setFileList(files);
            $("#file-upload-form").modal('show')
        }
    }
}
</script>

<style lang="less" scoped>
.btn {
  border-radius: 0px;
  margin-right: 10px;
}
</style>