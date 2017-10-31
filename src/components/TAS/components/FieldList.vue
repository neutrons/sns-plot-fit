<template>
  <div class="variable-list">
        <!-- X Variable Selection -->
        <fieldset :disabled="currentData.length === 0">
            <div class="input-group">
                <span class="input-group-addon">X Variable</span>
                <select ref='x_select' class="form-control" v-model="selected.x">
                    <option v-for="field in fields">{{field}}</option>
                </select>
            </div>

            <!-- Y Variable Selection -->
            <div class="input-group">
                <span class="input-group-addon">Y Variable</span>
                <select ref='y_select' class="form-control" v-model="selected.y">
                    <option v-for="field in fields">{{field}}</option>
                </select>
            </div>

            <button class="btn btn-primary btn-xs btn-swap-fields" @click="swapFields"><i class="fa fa-refresh" aria-hidden="true"></i> Swap Fields</button>
        </fieldset>
</div>
</template>

<script>
/* Import Event Bus */
import { eventBus } from '../../../assets/javascript/eventBus';

export default {
    name: 'VariableList',
    props: {
        currentData: {
            required: true
        }
    },
    data: function () {
      return {
          selected: {
            x: 'pt.',
            y: 'detector'
          }
      }
    },
    computed: {
        fields() {
            let tempFields = Object.keys(this.currentData).length !== 0 ? Object.keys(this.currentData.data[0]) : [];
            
            tempFields.sort();

            return tempFields;
      }
    },
    methods: {
        swapFields() {
            [this.selected.x, this.selected.y] = [this.selected.y, this.selected.x];
            
            // eventBus.$emit('swap-fields');
        }
    },
    watch: {
        selected: {
            handler() {
                this.$emit('update-fields', this.selected)
            },
            deep: true
        }
    }
  }
</script>

<style lang="less" scoped>
.btn-swap-fields {
    width: 100%;
}
</style>
