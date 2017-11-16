<template>
  <div id="FitConfig">
    <!-- Fit Type Selections -->
    <div class="input-group">
        <span class="input-group-addon">Fit Type</span>
        <select class="form-control" v-model="fit" :disabled="DISABLE">
            <option v-for="fit in fits">{{fit.fit}}</option>
        </select>
    </div>

    <!-- Equation Input/Editer-->
    <div class="input-group">
        <span class="input-group-addon">Equation</span>
        <input type="text" class="form-control" id="fit-equation" :value="EQUATION" @keyup.enter="enterEquation" :disabled="DISABLE || fit === 'None'" @focus="isFocus = !isFocus" @blur="isFocus = !isFocus">
    </div>

    <p class="equation-title" v-if="isFocus">Press <strong>[enter]</strong> to change equation</p>

    <!-- Coefficients Input/Editer-->
    <fieldset :disabled="DISABLE">
        <div v-if="isCoefficients">
            <h5>Coefficients:</h5>
            <div class="coefficients-input input-group" v-for="(coef, key) in coefficients">
                <span class="input-group-addon">{{ key }}</span>
                <input type="text" class="form-control" :id="key + '-input'" :value="coef" @keyup.enter="enterCoefficients">
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
            default: false
        },
        EQUATION: {
            type: String,
            required: true
        }
    },
    data: function () {
      return {
        isFocus: false,
        coefficients: {},
        fit: 'Linear'
      }
    },
    created() {
        // Listen to emit from plotCurrentData.js
        eventBus.$on('update-coefficients', this.updateCoefficients);
    },
    computed: {
        fits() {
            return this.$store.getters.getFitConfigs(this.$route.name);
        },
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
            for(let key in this.coefficients) {
                let val = document.getElementById(key+"-input").value;
                c[key] = +val;
            }

            eventBus.$emit("coefficients-updated", _.cloneDeep(c));
        },
        updateCoefficients(coeff) {
            this.coefficients = coeff;
        },
        setFitBack() {
            this.fit = 'Linear';
        }
    },
    watch: {
        fit() {
            if (this.fit === 'None') this.coefficients = {};
            this.$emit('set-fit', this.fit);
        }
    }
  }
</script>

<style scoped>
#FitConfig {
    text-align: center;
}
</style>
