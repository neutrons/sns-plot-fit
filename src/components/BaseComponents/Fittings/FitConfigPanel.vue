<template>
  <div class='fit-config'>
    <!-- Fit Type Selections -->
    <div class='input-group'>
        <span class='input-group-addon'>Fit Type</span>
        <select class='form-control' :value='fit' @change='setFit($event.target.value)' :disabled='disable'>
            <option v-for='(fit, key) in fits' :key='key'>{{key}}</option>
        </select>
    </div>

    <!-- Equation Input/Editer-->
    <div class='input-group'>
        <span class='input-group-addon'>Equation</span>
        <input type='text'
            class='form-control'
            id='fit-equation'
            data-toggle='tooltip'
            title='Press [Enter] to submit equation.'
            :value='equation' @keyup.enter='enterEquation'
            :disabled='disable || fit === "None"'>
    </div>

    <div class='init-val-group' v-if='fit === "None" || !disable'>
        <h5 class='text-center'>Initial Values:</h5>
        <v-initial-values-input
            v-for='(value, index) in initialValues'
            :key='index'
            :name='value[0]'
            :value.sync='initialValues[index][1]'
            :constant.sync='initialValues[index][2]'
            :disable='disable || fit === "None"'
            :field='field'
            :data='data'
            :file-to-fit='fileToFit'
            @setInitialValues='$emit("update-initial-values", initialValues)'
        ></v-initial-values-input>
    </div>

    <button class='btn btn-primary btn-block btn-xs' :disabled='disable || fit === "None"' @click='refit'>Fit</button>
    <button class='btn btn-danger btn-block btn-xs' :disabled='disable' @click="resetFit"><i class="fa fa-times-circle" aria-hidden="true"></i> Remove Fit</button>

</div>
</template>

<script>
import InitialValuesInput from './InitialValuesInput';
import { eventBus } from '../../../assets/javascript/eventBus.js';

export default {
    name: 'FitConfigPanel',
    components: {
        'v-initial-values-input': InitialValuesInput,
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
        parameters: {
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
        fit: 'Linear',
        fits: this.$store.getters.getFitConfigs(this.id),
        toggle: false,
      };
    },
    computed: {
        params() {
            return _.cloneDeep(this.parameters);
        },
    },
    methods: {
        resetFit() {
            this.$emit('reset-file-fit-choice');
        },
        setFitSettings() {
            this.$emit('set-fit-settings', _.cloneDeep(this.fitSettings));
        },
        enterEquation() {
            let newEq = document.getElementById('fit-equation').value;
            this.$emit('set-equation', newEq);
        },
        setFit(fit) {
            this.fit = fit;
            this.$emit('set-fit', this.fit);
        },
        refit() {
            this.$emit('refit');
        }
    },
  }
</script>

<style scoped>
.fit-config {
    text-align: center;
}

.constant-toggle {
  transition: all 0.1s ease;
}
</style>
