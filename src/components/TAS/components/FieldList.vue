<template>
  <div class="variable-list">
        <!-- X Variable Selection -->
        <fieldset :disabled="currentFields.length === 0">
            <div class="input-group">
                <span class="input-group-addon">X Variable</span>
                <select ref='x_select' class="form-control" v-model="selected.x" @change="$emit('update-fields', 'x', $event.target.value)">
                    <option v-for="field in currentFields">{{field}}</option>
                </select>
            </div>

            <!-- Y Variable Selection -->
            <div class="input-group">
                <span class="input-group-addon">Y Variable</span>
                <select ref='y_select' class="form-control" v-model="selected.y" @change="$emit('update-fields', 'y', $event.target.value)">
                    <option v-for="field in currentFields">{{field}}</option>
                </select>
            </div>

            <button class="btn btn-primary btn-xs btn-swap-fields" @click="$emit('update-fields', 'swap')"><i class="fa fa-refresh" aria-hidden="true"></i> Swap Fields</button>
        </fieldset>
</div>
</template>

<script>
/* Import Event Bus */
import { eventBus } from '../../../assets/javascript/eventBus';

export default {
    name: 'VariableList',
    props: {
        currentFields: {
            required: true
        }
    },
    data: function () {
      return {
          selected: {
            x: 'pt',
            y: 'detector'
          }
      }
    },
    methods: {
        resetSelected() {
            this.selected = {
                x: 'pt',
                y: 'detector'
            }
        }
    }
  }
</script>

<style lang="less" scoped>
.btn-swap-fields {
    width: 100%;
}
</style>
