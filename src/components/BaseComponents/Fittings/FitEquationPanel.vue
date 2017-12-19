<template>
<div class='fit-equation'>

  <div class='input-group' v-for='(eq, index) in selected' :key='index'>
    <span class='input-group-addon' :class='eq.type'>
           <select @input='updateChoice(index, $event.target.value)' v-if='index === 0'>
            <option v-for="(option, key) in options" :key='key' :value="`${JSON.stringify(options[key])}`" v-if='option.type !== "bg"'>
              {{optionChoice(option.fit, option.type)}}
            </option>
        </select>

        <select @input='updateChoice(index, $event.target.value)' v-else>
          <option v-for="(option, key) in options" :key='key' :value="`${JSON.stringify(options[key])}`">
            {{optionChoice(option.fit, option.type)}}
          </option>
        </select>
      </span>

    <p class='form-control'>{{selected[index].equation}}</p>

    <div class='input-group-btn' v-if='$route.meta.group === "TAS"'>
      <button class='btn btn-success btn-add' @click='addEquation' v-if='index === 0'><i class='fa fa-plus'></i></button>

      <button class="btn btn-danger" @click='removeEquation(index)' v-else>
            <i class="fa fa-times"></i>
        </button>
    </div>
  </div>

  <div class='input-group'>
    <span class='input-group-addon'>Final Equation</span>
    <input class='form-control' v-model.lazy='finalEquation' />

    <div class="input-group-btn">
      <button class="btn btn-success" @click='fit'>
          Fit
        </button>
    </div>
  </div>

  <!--   initial values -->
  <v-panel PANELTITLE='Initial Values' PANELTYPE='info' :COLLAPSE='false'>
    <div class='input-group' v-for='(item, index) in IV' :key='index'>

      <span class='input-group-addon'>{{item[0]}}</span>

      <input class='form-control' type='number' step='0.01' v-model.number.lazy='item[1]' @keyup.enter='fit' />

      <label class='input-group-addon'>
                <input type='checkbox' v-model='item[2]' style='visibility: hidden; position: absolute;'/>
                <i class='fa fa-circle constant-toggle' :style="`color: ${item[2] ? 'brown' : 'green'};`"></i>
            </label>

    </div>
  </v-panel>
</div>
</template>

<script>
import { eventBus } from '../../../assets/javascript/eventBus.js';
import math from 'mathjs';
import _ from 'lodash';
import Vue from 'vue';

import Panel from '../Panels/Panel.vue';

export default {
  name: 'FitEquationPanel',
  components: {
      'v-panel': Panel,
  },
  props: {
    disable: {
      type: Boolean,
      default: false,
    },
    equation: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    field: {
      type: Object,
    },
    initialValues: {
      type: Array,
    },
    data: {
      type: Array,
    },
    fileToFit: {
      type: String,
    },
  },
  data: function () {
    return {
      selected: [],
      options: this.$store.getters.getFitConfigs(this.id),
      finalEquation: '',
      IV: [],
    };
  },
  created() {
    this.selected.push(_.cloneDeep(this.options['Linear']));
  },
  methods: {
    optionChoice(fit, type) {
        let result = type === undefined ? '' : ' - ' + type;

        return fit + result;
    },
    addEquation() {
        let temp = _.cloneDeep(this.options['Linear']);
        
        // console.log('add equation', temp);

        for (let i = 0, L = temp.initialValues.length; i < L; i++) {
            if (typeof temp.initialValues[i][1] === 'string') {
                temp.initialValues[i][1] = enterInitialValue(temp.initialValues[i][1], i);
            }
        };

        temp = this.formatCoefficients(temp, this.selected.length);

        this.selected.push(temp);
    },
    removeEquation(index) {
        this.selected.splice(index, 1);
    },
    parse(value) {
        // Parse the string
        let parsed = math.parse(value.equation);

        // Getting all variables to fit and remove x
        let nodes = parsed.filter(function (node) {
            return node.isSymbolNode && node.name !== 'x';
        });

        let params = nodes.map(function (node) {
            return node.name;
        });

        return params = _.uniq(params);
    },
    formatCoefficients(value, i) {
        let params = this.parse(value);

        let newParams = params.map((el) => {
            return el + i;
        });

        params.forEach((el, index) => {
            let reg = new RegExp(el, 'g');
            value.equation = value.equation.replace(reg, newParams[index]);

            value.initialValues.forEach((iv) => {
                if (iv[0] === el) {
                    iv[0] = newParams[index];
                }
            })
        });

        return value;
    },
    updateChoice(index, value) {
        let temp = JSON.parse(value);

        for (let i = 0, L = temp.initialValues.length; i < L; i++) {
            if (typeof temp.initialValues[i][1] === 'string') {
                temp.initialValues[i][1] = this.enterInitialValue(temp.initialValues[i][1], i);
            }
        };

        if (index !==0) {
            temp = _.cloneDeep(this.formatCoefficients(temp, index));
        }

        Vue.set(this.selected, index, temp);
    },
    enterInitialValue(exp, i) {
        let result = '';

        try {
            // console.log(`Entered value '${exp}'`);
            let code = math.compile(exp);

            // First convert x,y fields to single arrays
            let obj = this.identifyFields();

            result = exp === '' ? 1 : code.eval(obj);
            // console.log('Result', result);

            // Catch that result is not an array for cases when user enters 'x+1'
            // Math.JS treats that as operating on an array, so there isn't a reduced value
            if (Array.isArray(result)) {
                throw 'Function must return a single value, not an array.';
            } else {
                return result.toFixed(3);
            }
            
        } catch (error) {
            // If an error occurs when altering initial values send it to error function
            eventBus.$emit('error-message', error, 'danger');
            return 1;
        }
    },
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
    fit() {
        this.$emit('update:equation', this.finalEquation);
        this.$emit('update:initialValues', this.IV);
        console.log('fit data');
        if (this.$route.meta.group === 'SANS') {
            this.$emit('fit', _.cloneDeep(this.selected[0]));
        } else {
            this.$emit('fit');
        }
    },
  },
  watch: {
    selected() {
        let temp = '';

        for (let i = 0, L = this.selected.length; i < L; i++) {
            temp += this.selected[i].equation;

            if (i + 1 < L) {
                temp += '+';
            }
        };

        this.finalEquation = temp;
    },
    finalEquation() {
        // console.log('final equation updated');
        let temp = [];

        this.selected.forEach((el) => {
            el.initialValues.forEach((item) => {
                temp.push(_.cloneDeep(item));
            })
        });

        // First parse final eq
        let parsed = this.parse({
            equation: this.finalEquation
        });

        // Second, find and add new IVs
        // or remove IVs not present
        let checklist = [];
        let count = 0;

        this.selected.forEach((el) => {
            el.initialValues.forEach((item) => {
                checklist.push(item[0]);
            })
        });

        checklist.forEach((el, index) => {
            if (parsed.indexOf(el) === -1) {
                // console.log('removing', el, index);
                temp.splice(index - count, 1);
                count++;
            }
        });

        parsed.forEach((el, index) => {
            if (checklist.indexOf(el) === -1) {
                // console.log('adding', el, index);
                temp.push([el, 1, false]);
            }
        });

        // Lastly, if initial value is not new, maintain previous state
        temp.forEach( (el) => {
            this.IV.forEach( (item) => {
                if (el[0] === item[0]) {
                    el[1] = item[1];
                    el[2] = item[2];
                }
            })
        })

        this.IV = _.cloneDeep(temp);

        this.fit();
    },
    initialValues() {
        // console.log('initial values updated', this.initialValues);
        this.IV = _.cloneDeep(this.initialValues);
    },
  },
};
</script>

<style scoped>
.fit-config {
    text-align: center;
}

.constant-toggle {
  transition: all 0.1s ease;
}
</style>
