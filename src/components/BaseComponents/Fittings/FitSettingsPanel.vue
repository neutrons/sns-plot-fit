<template>
  <div id='FitSettingsPanel'>
    <fieldset :disabled='disable'>
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
        <button class='btn btn-warning btn-sm btn-block' 
            @click='$emit("reset-fit-settings")'>
            <i class='fa fa-refresh' aria-hidden='true'></i> Default Settings
        </button>
    </fieldset>
</div>
</template>

<script>
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
            type: Array,
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
};
</script>

<style lang='less' scoped>

</style>
