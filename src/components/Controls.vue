<template>
  <div id="Controls">

      <div id="control-panel">

        <div id="controls-bg">
            <div class="panel panel-default">
                <div id="control-panel-collapse" class="panel-heading"> Controls <span class="glyphicon glyphicon-menu-down pull-right"></span></div>
            </div>
            <div id="control-panel-group">

                <div class="panel-group" id="accordion-control">

                <!-- Scales Panel -->
                <div class="panel panel-info">
                    <div class="panel-heading">
                        <a class="panel-title" data-toggle="collapse" data-parent="#accordion-control" href="#collapse-scales">Scales</a>
                    </div>
                    <div id="collapse-scales" class="panel-collapse collapse in">
                        <div class="panel-body">
                            <select class="form-control" v-model="xScale" :disabled="!BUTTONDIS" @change="setScales">
                            <option v-for="option in xScales">{{option}}</option>
                            </select>
                            
                            <select class="form-control" v-model="yScale" :disabled="!BUTTONDIS" @change="setScales">
                            <option v-for="option in yScales">{{option}}</option>
                            </select>
                            
                            <button id="btn-reset-scales" class="btn btn-warning btn-sm" @click="resetScales" :disabled="!BUTTONDIS">Reset Scales <span class="glyphicon glyphicon-refresh"></span></button>
                        </div>
                    </div>
                </div>

                <!-- Fitting Selections Panel -->
                <div class="panel panel-info">
                    <div class="panel-heading">
                        <a class="panel-title" data-toggle="collapse" data-parent="#accordion-control" href="#collapse-fit">Fit</a>
                    </div>
                    <div id="collapse-fit" class="panel-collapse collapse">
                        <div class="panel-body">
                            <select class="form-control" v-model="fit" :disabled="!FILETOFIT">
                            <option v-for="fit in fits">{{fit}}</option>
                            </select>
                            <p class="equation-title">Equation:</p>
                            <input type="text" class="form-control" id="fit-equation" :value="EQUATION" @keyup.enter="enterEquation" :disabled="!FILETOFIT" @focus="isFocus = !isFocus" @blur="isFocus = !isFocus">
                            <p class="equation-title" v-if="isFocus">Press <strong>[enter]</strong> to change equation</p>
                            <button id="btn-remove-fit" class="btn btn-danger btn-sm" @click="resetFit" :disabled="!FILETOFIT">Remove Fit <span class="glyphicon glyphicon-remove-sign" ></span></button>
                        </div>
                    </div>
                </div>

                <!-- Fit Settings Panel -->
                <div class="panel panel-info">
                    <div class="panel-heading">
                        <a class="panel-title" data-toggle="collapse" data-parent="#accordion-control" href="#collapse-fit-settings">Levenberg–Marquardt Parameters</a>
                    </div>
                    <div id="collapse-fit-settings" class="panel-collapse collapse">
                        <div class="panel-body">
                            <label>Damping: <span class="damping-output">{{ fitSettings.damping }}</span></label>
                            <input type="range" v-model.number="fitSettings.damping" min="0.001" max="10" step="0.001" :disabled="!FILETOFIT" @mouseup="setFitSettings" @keyup="setFitSettings" @touchend="setFitSettings" >

                            <label>Gradient Difference: <span class="iteration-output">{{ fitSettings.gradientDifference }}</span></label>
                            <input type="range" v-model.number="fitSettings.gradientDifference" min="0.01" max="1" step="0.01" :disabled="!FILETOFIT" @mouseup="setFitSettings" @keyup="setFitSettings" @touchend="setFitSettings" >
                            
                            <label>Max Iterations: <span class="iteration-output">{{ fitSettings.maxIterations }}</span></label>
                            <input type="range" v-model.number="fitSettings.maxIterations" min="100" max="10000" step="100" :disabled="!FILETOFIT" @mouseup="setFitSettings" @keyup="setFitSettings" @touchend="setFitSettings" >
                            
                            <label>Error Tolerance: <span class="tolerance-output">{{ fitSettings.errorTolerance }}</span></label>
                            <input type="range" v-model.number="fitSettings.errorTolerance" min="0.001" max="1" step="0.001" :disabled="!FILETOFIT" @mouseup="setFitSettings" @keyup="setFitSettings" @touchend="setFitSettings" >
                            <br>
                            <button id="btn-reset-fit-settings" class="btn btn-warning btn-sm" @click="resetSettings" :disabled="!FILETOFIT">Default Settings <span class="glyphicon glyphicon-remove-sign" ></span></button>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../assets/javascript/eventBus';

import * as _ from 'lodash';

export default {
  name: 'Controls',
  props: ["BUTTONDIS", "FILETOFIT", "EQUATION"],
  data: function() {
    return {
      isFocus: false,
      xScale: 'X',
      xScales: ["X", "X^2", "Log(X)"],
      yScale: 'Y',
      yScales: ["Y", "Y^2", "Log(Y)"],
      fit: 'Linear',
      fits: ["None", "Linear", "Guinier", "Porod", "Zimm", "Kratky", "Debye Beuche"],
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
    resetScales: function() {
      this.xScale = 'X';
      this.yScale = 'Y';
      eventBus.$emit('set-scales', 'X', 'Y');
    },
    resetFit: function() {
    //   this.fit = 'None';
        eventBus.$emit('reset-file-to-fit');
    },
    enterEquation: function() {
      let newEq = document.getElementById('fit-equation').value;
      eventBus.$emit('set-equation', newEq);
    },
    setScales: function() {
      eventBus.$emit('set-scales', this.xScale, this.yScale);
    },
    setFitBack: function() {
        this.fit = 'Linear';
    },
    resetSettings: function() {
        console.log("Reset values...");
        this.fitSettings.maxIterations = 100;
        this.fitSettings.damping = 0.001;
        this.fitSettings.errorTolerance = 0.001;
        this.fitSettings.gradientDifference = 0.1;
        eventBus.$emit('set-fit-settings', _.cloneDeep(this.fitSettings)); // clone object or it passes fitSettings by reference not value
    },
    setFitSettings: function() {
        console.log(this.fitSettings);
        eventBus.$emit('set-fit-settings', _.cloneDeep(this.fitSettings)); // clone object or it passes fitSettings by reference not value
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
    eventBus.$on('set-fit-back', this.setFitBack);
    eventBus.$on('set-fit-settings-back', this.resetSettings);
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

#btn-reset-scales, #btn-remove-fit, #btn-reset-fit-settings {
  width: 100%;
}

.equation-title {
  color: gray;
  text-align: center;
}

#control-panel-collapse {
    width: 100%;
}

#control-panel-collapse:hover {
    cursor: pointer;
}

#controls-bg {
    background: rgba(0,0,0, 0.02);
}

#control-panel-group {
    display: none;
    padding: 10px;
}

.iteration-output, .damping-output {
    color: steelblue;
}

.tolerance-output {
    color: brown;
}

select, input {
    margin-bottom: 5px;
}
</style>