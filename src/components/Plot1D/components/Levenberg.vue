<template>
  <div id="Levenberg">
    <fieldset :disabled="DISABLE" :class="DISABLE ? 'disabled' : ''">
        <label>Damping: <span class="fit-settings">{{ fitSettings.damping }}</span></label>
        <input type="range" v-model.number="fitSettings.damping" min="0.001" max="10" step="0.001" @mouseup="setFitSettings" @keyup="setFitSettings" @touchend="setFitSettings" >

        <label>Gradient Difference: <span class="fit-settings">{{ fitSettings.gradientDifference }}</span></label>
        <input type="range" v-model.number="fitSettings.gradientDifference" min="0.01" max="1" step="0.01" @mouseup="setFitSettings" @keyup="setFitSettings" @touchend="setFitSettings" >
        
        <label>Max Iterations: <span class="fit-settings">{{ fitSettings.maxIterations }}</span></label>
        <input type="range" v-model.number="fitSettings.maxIterations" min="100" max="10000" step="100" @mouseup="setFitSettings" @keyup="setFitSettings" @touchend="setFitSettings" >
        
        <label>Error Tolerance: <span class="fit-settings tolerance">{{ fitSettings.errorTolerance }}</span></label>
        <input type="range" v-model.number="fitSettings.errorTolerance" min="0.001" max="1" step="0.001" @mouseup="setFitSettings" @keyup="setFitSettings" @touchend="setFitSettings" >
        <br>
        <button class="btn btn-warning btn-sm btn-block" @click="resetSettings"><i class="fa fa-refresh" aria-hidden="true"></i> Default Settings</button>
    </fieldset>
</div>
</template>

<script>
export default {
    name: 'Levenberg',
    props: {
        DISABLE: {
            type: Boolean,
            default: false
        }
    },
    data: function () {
      return {
        fitSettings: {
            damping: 0.001,
            initialValues: [],
            gradientDifference: 0.1,
            maxIterations: 100,
            errorTolerance: 0.001
        }
      }
    },
    methods: {
        resetSettings() {
            this.fitSettings.damping = 0.001;
            this.fitSettings.gradientDifference = 0.1;
            this.fitSettings.maxIterations = 100;
            this.fitSettings.errorTolerance = 0.001;
            
            this.setFitSettings();
        },
        setFitSettings() {
            this.$emit('set-fit-settings', _.cloneDeep(this.fitSettings)); // clone object or it passes fitSettings by reference not value
        }
    }
  }
</script>

<style lang="less" scoped>
.disabled {
    opacity: 0.75;
}
</style>
