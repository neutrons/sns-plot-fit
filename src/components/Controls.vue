<template>
  <div id="Controls">
      <div class="selections controls row">
        <h3>Reset:</h3>
        <button class="btn btn-warning btn-sm" @click="resetPlot" :disabled="!BUTTONDIS">Reset Plot <span class="glyphicon glyphicon-refresh"></span></button>
        <br>
        <h3>Scales:</h3>
        <select class="form-control" v-model="xScale" :disabled="!BUTTONDIS" @change="setScales">
        <option v-for="option in xScales">{{option}}</option>
        </select>
        <br>
        <select class="form-control" v-model="yScale" :disabled="!BUTTONDIS" @change="setScales">
        <option v-for="option in yScales">{{option}}</option>
        </select>
        <br>
        <button class="btn btn-warning btn-sm" @click="resetScales" :disabled="!BUTTONDIS">Reset Scales <span class="glyphicon glyphicon-refresh"></span></button>
        <h3>Fit:</h3>
        <select class="form-control" v-model="fit" :disabled="!FILETOFIT">
        <option v-for="fit in fits">{{fit}}</option>
        </select>
        <br>
        <label class="equation-title">Equation:</label>
        <input type="text" class="form-control" id="fit-equation" :value="EQUATION" @keyup.enter="enterEquation" :disabled="EQUATION === null">
        <br>
        <button class="btn btn-danger btn-sm" @click="resetFit">Remove Fit  <span class="glyphicon glyphicon-remove-sign"></span></button>
      </div>
  </div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../assets/javascript/eventBus';

export default {
  name: 'Controls',
  props: ["BUTTONDIS", "FILETOFIT", "EQUATION"],
  data: function() {
    return {
      xScale: 'X',
      xScales: ["X", "X^2", "Log(X)"],
      yScale: 'Y',
      yScales: ["Y", "Y^2", "Log(Y)"],
      fit: 'None',
      fits: ["None", "Linear", "Guinier", "Porod", "Zimm", "Kratky", "Debye Beuche"]
    }
  },
  methods: {
    resetScales: function() {
      this.xScale = 'X';
      this.yScale = 'Y';
      eventBus.$emit('set-scales', 'X', 'Y');
    },
    resetFit: function() {
      this.fit = 'None';
    },
    enterEquation: function() {
      let newEq = document.getElementById('fit-equation').value;
      eventBus.$emit('set-equation', newEq);
    },
    resetPlot: function() {
      eventBus.$emit('reset-plot');
    },
    setScales: function() {
      eventBus.$emit('set-scales', this.xScale, this.yScale);
    }
  },
  watch: {
    fit: function() {
      eventBus.$emit('set-fit', this.fit);
    }
  },
  created() {
    eventBus.$on('reset-fit', this.resetFit);
    eventBus.$on('reset-scales', this.resetScales);
  }
}
</script>

<style scoped>
.form-control {
  text-align-last: center;
}

.form-inline > * {
   margin:0px 15px;
}

.controls {
  text-align: center;
  min-height: 90vh;
  margin-bottom: 0px;
  padding: 25px;
  background-color: gainsboro;
  border-right: 1px solid rgba(0,0,0,0.25);
}

.btn {
  width: auto;
}

.equation-title {
  color: #007833;
}
</style>