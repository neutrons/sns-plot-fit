<template>
  <div id='FitSettingsPanel'>
    <fieldset :disabled='disable' :class='disable ? "disabled" : ""'>
        <h5 class='text-center'>Initial Values:</h5>
        <v-initial-values-input
            v-for='(value, key) in initValues'
            :key='key'
            :name='key'
            :disable='disable'
            :value.sync='initValues[key]'
            :field='field'
            :data='data'
            :file-to-fit='fileToFit'
            @input='$emit("update-initial-values", initValues)'
        ></v-initial-values-input>

        <h5 class='text-center'>Parameters:</h5>
        <v-range-slider
            v-for='(param, key) in params'
            :key='key'
            :disable='disable'
            :name='key'
            :min='param.min'
            :max='param.max'
            :step='param.increment'
            :value.sync='param.value'
            @input='$emit("update-parameters", params)'
        ></v-range-slider>
        <br>
        <slot></slot>
    </fieldset>
</div>
</template>

<script>
import InitialValuesInput from './InitialValuesInput';
import RangeSlider from '../RangeSlider';
import _ from 'lodash';

export default {
    name: 'FitSettingsPanel',
    props: {
        data: {
            type: Array,
        },
        field: {
            type: Object,
        },
        parameters: {
            type: Object,
        },
        initialValues: {
            type: Object,
        },
        disable: {
            type: Boolean,
            default: false,
        },
        fileToFit: {
            type: String,
        },
    },
    components: {
        'v-initial-values-input': InitialValuesInput,
        'v-range-slider': RangeSlider,
    },
    computed: {
        initValues() {
            return _.cloneDeep(this.initialValues);
        },
        params() {
            return _.cloneDeep(this.parameters);
        }
    },
    methods: {
        resetSettings() {

        }
    }
};
</script>

<style lang='less' scoped>
.disabled {
    opacity: 0.75;
}
</style>
