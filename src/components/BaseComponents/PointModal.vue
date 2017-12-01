<template>
    <!-- Modal for Point Deletion -->
    <div class="modal fade" id="myModal" role="dialog" data-keyboard="false" data-backdrop="static">
        <div class="modal-dialog modal-sm">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Deleting Point</h4>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to remove the point?</p>
            </div>
            <div class="modal-footer">
                <button id="btn-no-delete" type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                <button id="btn-yes-delete" type="button" class="btn btn-danger btn-ok">Delete</button>
            </div>
        </div>
        </div>
    </div>
</template>

<script>
import { eventBus } from '../../assets/javascript/eventBus.js';

export default {
    name: 'PointModal',
    data: function () {
      return {
        
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
