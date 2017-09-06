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
        <input type="text" class="form-control" id="fit-equation" :value="equation" @keyup.enter="enterEquation" :disabled="DISABLE || fit === 'None'" @focus="isFocus = !isFocus" @blur="isFocus = !isFocus">
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

        <button class="btn btn-danger btn-sm btn-block" @click="resetFit"><i class="fa fa-minus-circle" aria-hidden="true"></i> Remove Fit</button>
    </fieldset>

</div>
</template>

<script>
export default {
    name: 'FitConfig',
    props: {
        DISABLE: {
            type: Boolean,
            default: false
        }
    },
    data: function () {
      return {
        isFocus: false,
        coefficients: {
            'm': 1.23,
            'b': 3000
        },
        fit: 'Linear',
        equation: 'mx + b'
      }
    },
    computed: {
        fits() {
            // console.log(this.$store.getters.getFitConfigs);
            return this.$store.getters.getFitConfigs;
        },
        isCoefficients() {
          return Object.keys(this.coefficients).length > 0;
        }

    },
    methods: {
        resetFit() {
            this.setFitSettings();
            // eventBus.$emit('set-fit-settings', _.cloneDeep(this.fitSettings)); // clone object or it passes fitSettings by reference not value
        },
        setFitSettings() {
            //eventBus.$emit('set-fit-settings', _.cloneDeep(this.fitSettings)); // clone object or it passes fitSettings by reference not value
        },
        enterEquation() {
            //let newEq = document.getElementById('fit-equation').value;
            // eventBus.$emit('set-equation', newEq);
        },
        enterCoefficients() {
            // let c = {};
            // for(let key in this.coefficients) {
            //     let val = document.getElementById(key+"-input").value;
            //     c[key] = +val;
            // }

            // eventBus.$emit("coefficients-updated", _.cloneDeep(c));
        },
        updateCoefficients(coeff) {
            this.coefficients = coeff;
        }
    }
  }
</script>

<style scoped>
#FitConfig {
    text-align: center;
}

.input-group {
    margin-bottom: 10px;
}
</style>
