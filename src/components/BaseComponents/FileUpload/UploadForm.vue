<template>
    <!-- Modal for Point Deletion -->
    <div class="modal fade" id="file-upload-form" role="dialog" data-keyboard="false" data-backdrop="static">
        <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Load Files</h4>
            </div>
            <div class="modal-body">

                <table class="table table-condensed table-bordered" v-if="fileList.length > 0">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>File</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(file, index) in fileList">
                            <td>{{index}}</td>
                            <td width="70%">{{file.filename}}</td>
                            <td width="30%">
                                <select class="form-control" @change="file.type = $event.target.value">
                                    <option v-for="t in type">
                                        {{t}}
                                    </option>
                                </select>
                            </td>
                            <td><button class="btn btn-danger btn-xs" @click="removeFromList(index)"><i class="fa fa-times"></i></button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="modal-footer">
                <label id="file-load-btn" class="btn btn-success pull-left">
                    <i class="fa fa-plus" aria-hidden="true"></i> 
                    Add File(s) 
                    <input id="file-upload" type="file" style="display: none;" @change="setFileList($event.target.files)" multiple>
                </label>

                <button id="btn-cancel" type="button" class="btn btn-default" data-dismiss="modal" @click="cancelUpload">Cancel</button>
                <button id="btn-submit" type="button" class="btn btn-success" :disabled="!(fileList.length > 0)" @click="uploadFiles">Upload Files</button>
            </div>
        </div>
        </div>
    </div>
</template>

<script>
import { eventBus } from '../../../assets/javascript/eventBus.js';

export default {
    name: 'UploadForm',
    data: function () {
      return {
        fileList: [],
        type: [
            "SANS1D", 
            "SANS2D",
            "TAS",
            "Stitch",
            "SANS1D-Stitch"
        ]
      }
    },
    methods: {
        setFileList(files) {

            var vm = this;

            for (var i = 0, len = files.length; i < len; i++) {
                // loadFiles(files[i]);
                let url = files[i].name;
                let blob = files[i];
                
                let re = /.dat|.txt/g;
                let match = url.search(re);
                let filename = url.slice(0, match);

                if (match > 0) {
                    
                    vm.fileList.push({
                        url,
                        blob,
                        filename,
                        type: "SANS1D"
                    })
                } else {
                    // error, don't read for now
                    let errorMsg = "<strong>Error! </strong>" + url + " is not a supported type.<br/>Make sure the file ends in <em>'.txt'</em> or <em>'.dat'</em>";
                    eventBus.$emit('error-message', errorMsg, 'danger');
                }
            }
        },
        clearFileList() {
            this.fileList = [];
            document.getElementById("file-upload").value = '';
        },
        removeFromList(i) {
            this.fileList.splice(i,1);
        },
        cancelUpload() {
            $("#btn-cancel").off();
            $("#btn-submit").off();
            $("#file-upload-form").modal('hide');

            this.clearFileList();
        },
        uploadFiles() {
            $("#btn-no-delete").off();
            $("#btn-submit").off();
            $("#file-upload-form").modal('hide');

            // Send files to be added to specified components
            let f = _.cloneDeep(this.fileList);
            // console.log(f);
            eventBus.$emit('upload-files', f);

            // Clear list for next cycle of uploads
            this.clearFileList();
        }
    }
  }
</script>

<style lang="less" scoped>
table {

    * > {
        vertical-align: middle !important;
    }

    th {
        text-align: center;
    }

    td {

        white-space:nowrap;

        select {
            width: 100%;
            text-align-last: center;
        }
    }
}
</style>
