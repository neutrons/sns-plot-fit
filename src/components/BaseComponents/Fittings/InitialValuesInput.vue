<template>
<div :class='{disable}'>
  <div class='input-group'>
    <span class='input-group-addon'>{{name}}</span>
    <input class='form-control' 
        type='text'
        :disabled='disable'
        v-model.lazy='initialValue'
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
            return this.value;
        },
        set: function setInitialValue(newVal) {
            this.validateValue(newVal);
        }
      },
      splitFields() {
        let obj = {x:[], y:[]};

        this.data.forEach( (d) => {
            if (d.filename === this.fileToFit) {
                for (let key in this.field) {
                    obj[key] = d.dataTransformed.map((el) => { return el[this.field[key]]; });
                }
            }
        })
        
        return obj;
      }
    },
    methods: {
        validateValue(newVal) {
            let result = '';

            try {
                // console.log(`Entered value '${exp}'`);
                let code = math.compile(newVal);
                
                result = newVal === '' ? 1 : code.eval(this.splitFields);
                
                // Catch that result is not an array for cases when user enters 'x+1'
                // Math.JS treats that as operating on an array, so there isn't a reduced value
                if (Array.isArray(result)) {
                    throw 'Function must return a single value, not an array.';
                }

                // console.log('Entered Result', result);
                // console.log('New Value', newVal);
                // Emit input if entered value is not the same as previous entry
                if (result !== this.value) {
                    // console.log('Updating with new value', this.value, newVal)
                    this.$emit('update:value', +result);
                    this.$emit('setInitialValues');
                }
                
            } catch (error) {
                // If an error occurs when altering initial values send it to error function
                eventBus.$emit('error-message', error, 'danger');
            }
        },
    },
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