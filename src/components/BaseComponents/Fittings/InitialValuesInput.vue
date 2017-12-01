<template>
<div :class='{disable}'>
  <div class='input-group'>
    <span class='input-group-addon'>{{name}}</span>
    <input class='form-control' 
        type='text'
        :disabled='disable'
        :value='value'
        @keyup.enter='enterInitialValue($event.target.value)'
    />
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
    methods: {
        identifyFields() {
            let obj = {x:[], y:[]};

            this.data.forEach( (d) => {
                if (d.filename === this.fileToFit) {
                    for (let key in this.field) {
                        obj[key] = d.dataTransformed.map((el) => { return el[this.field[key]]; });
                    }
                }
            })
            
            return obj;
        },
        enterInitialValue(val) {
            let result = '';

            try {
                // console.log(`Entered value '${exp}'`);
                let code = math.compile(val);

                // First convert x,y fields to single arrays
                let obj = this.identifyFields();
                // console.log("OBJ:", obj);
                
                result = val === '' ? 1 : code.eval(obj);
                
                // Catch that result is not an array for cases when user enters 'x+1'
                // Math.JS treats that as operating on an array, so there isn't a reduced value
                if (Array.isArray(result)) {
                    throw 'Function must return a single value, not an array.';
                }

                // Emit input if entered value is not the same as previous entry
                if (result !== this.value) {
                    this.$emit('update:value', +result);
                    this.$emit('input');
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
</style>