<template>
  <div id="FitConfig">
    <!-- Fit Type Selections -->
    <div class="input-group">
        <span class="input-group-addon">Fit Type</span>
        <select class="form-control" :value='fit' @change='setFit($event.target.value)' :disabled="DISABLE">
            <option v-for="fit in fits">{{fit.fit}}</option>
        </select>
    </div>

    <!-- Equation Input/Editer-->
    <div class="input-group">
        <span class="input-group-addon">Equation</span>
        <input type="text" class="form-control" id="fit-equation" data-toggle='tooltip' title='Press [Enter] to submit equation.' :value="EQUATION" @keyup.enter="enterEquation" :disabled="DISABLE || fit === 'None'">
    </div>

    <!-- Coefficients Input/Editer-->
    <fieldset :disabled="DISABLE">
        <div v-if="isCoefficients">
            <h5>Coefficients:</h5>
            <div class="coefficients-input input-group" v-for="(coef, key) in coefficients" :key='key'>
                <span class="input-group-addon">{{ key }}</span>
                <input type="text" class="form-control" :id="key + '-input'" :value="coef" @keyup.enter="enterCoefficients" data-toggle='tooltip' title='Press [Enter] to submit coefficient.'>
            </div>
        </div>

        <button class="btn btn-danger btn-sm btn-block" @click="resetFit"><i class="fa fa-times-circle" aria-hidden="true"></i> Remove Fit</button>
    </fieldset>

</div>
</template>

<script>
import { eventBus } from '../../../assets/javascript/eventBus.js';

export default {
    name: 'FitConfig',
    props: {
        DISABLE: {
            type: Boolean,
            default: false,
        },
        EQUATION: {
            type: String,
            required: true,
        },
        ID: {
            type: String,
            required: true,
        }
    },
    data: function () {
      return {
        coefficients: {},
        fit: 'Linear',
        fits: this.$store.getters.getFitConfigs(this.ID),
      };
    },
    created() {
        // Listen to emit from plotCurrentData.js
        eventBus.$on('update-coefficients', this.updateCoefficients);
    },
    computed: {
        isCoefficients() {
          return Object.keys(this.coefficients).length > 0;
        }

    },
    methods: {
        resetFit() {
            this.coefficients = {};
            this.$emit('reset-file-fit-choice');
        },
        setFitSettings() {
            this.$emit('set-fit-settings', _.cloneDeep(this.fitSettings));
        },
        enterEquation() {
            let newEq = document.getElementById('fit-equation').value;
            this.$emit('set-equation', newEq);
        },
        enterCoefficients() {
            let c = {};
            let flag = 1;
            for (let key in this.coefficients) {
                let val = document.getElementById(`${key}-input`).value;

                if (isNaN(parseFloat(+val))) {
                    eventBus.$emit('error-message', 'Please enter a valid number for coefficients.', 'warning');
                    flag = 0;
                } else {
                    c[key] = +val;
                }
            }

            if (flag) {
                eventBus.$emit("coefficients-updated", _.cloneDeep(c));
            }
        },
        updateCoefficients(coeff) {
            this.coefficients = coeff;
        },
        setFit(fit) {
            this.fit = fit;

            if (this.fit === 'None') this.coefficients = {};
            this.$emit('set-fit', this.fit);
        },
    },
  }
</script>

<style scoped>
#FitConfig {
    text-align: center;
}
</style>
