<template>
<div :class='{disable}'>
  <div class='input-group'>
    <span class='input-group-addon'>{{name}}</span>
    <input class='form-control' 
        type='number'
        step='0.35'
        :disabled='disable'
        v-model.number.lazy='initialValue'
    />

    <label class='input-group-addon'>
        <input type='checkbox' v-model='checked' style='visibility: hidden; position: absolute;'>
        <i class='fa fa-circle constant-toggle' :style="`color: ${checked ? 'brown' : 'green'};`"></i>
    </label>

  </div>
</div>
</template>

<script>
import math from 'mathjs';
import { eventBus } from '../../../assets/javascript/eventBus';

export default {
    name: 'TextInput',
    props: {
        name: {
            type: String,
        },
        value: {
            type: [String, Number],
        },
        constant: {
            type: Boolean,
        },
        disable: {
            type: Boolean,
            default: false,
        },
        field: {
            type: Object,
        },
        data: {
            type: Array,
        },
        fileToFit: {
            type: String,
        }
    },
    computed: {
      checked: {
        get: function getChecked() {
            return this.constant;
        },
        set: function setChecked(newVal) {
            this.$emit('update:constant', newVal);
        }
      },
      initialValue: {
        get: function getInitialValue() {
            return typeof this.value === 'string' ? 1 : this.value;
        },
        set: function setInitialValue(newVal) {
            // console.log('set initial value', newVal);
            this.$emit('update:value', newVal);
            this.$emit('setInitialValues');
        }
      },
    }
  };
</script>

<style lang='less' scoped>
.disable {
  opacity: 0.5;
}

.constant-toggle {
  transition: all 0.1s ease;
}
</style>