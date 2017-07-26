<template>
  <div id="Controls">

      <div id="control-panel" class="col-md-2">

        <div id="controls-bg">
            <div class="panel panel-default">
                <div id="left-panel-collapse" class="panel-heading"> Controls <span class="glyphicon glyphicon-menu-left pull-right"></span></div>
            </div>
            <div id="control-panel-group">

                <!-- Plot Setings Panel-->
                <div class="panel panel-info">
                    <div class="panel-heading">Plot Settings
                        <button class="btn btn-col btn-default btn-xs pull-right" data-toggle="collapse" href="#collapse-reset"></button>
                    </div>

                    <div id="collapse-reset" class="panel-collapse collapse in">
                        <div class="panel-body">
                            <button id="btn-reset-plot" class="btn btn-warning btn-sm" @click="resetPlot" :disabled="!BUTTONDIS">Reset Plot <span class="glyphicon glyphicon-refresh"></span></button>
                        </div>
                    </div>
                </div>

                <!-- Scales Panel -->
                <div class="panel panel-info">
                    <div class="panel-heading">Scales
                        <button class="btn btn-col btn-default btn-xs pull-right" data-toggle="collapse" href="#collapse-scales"></button>
                    </div>
                    <div id="collapse-scales" class="panel-collapse collapse in">
                        <div class="panel-body">
                            <select class="form-control" v-model="xScale" :disabled="!BUTTONDIS" @change="setScales">
                            <option v-for="option in xScales">{{option}}</option>
                            </select>
                            <br>
                            <select class="form-control" v-model="yScale" :disabled="!BUTTONDIS" @change="setScales">
                            <option v-for="option in yScales">{{option}}</option>
                            </select>
                            <br>
                            <button id="btn-reset-scales" class="btn btn-warning btn-sm" @click="resetScales" :disabled="!BUTTONDIS">Reset Scales <span class="glyphicon glyphicon-refresh"></span></button>
                        </div>
                    </div>
                </div>

                <!-- Fitting Selections Panel -->
                <div class="panel panel-info" v-if="FILETOFIT">
                    <div class="panel-heading">Fits
                        <button class="btn btn-col btn-default btn-xs pull-right" data-toggle="collapse" href="#collapse-fit"></button>
                    </div>
                    <div id="collapse-fit" class="panel-collapse collapse in">
                        <div class="panel-body">
                            <select class="form-control" v-model="fit" :disabled="!FILETOFIT">
                            <option v-for="fit in fits">{{fit}}</option>
                            </select>
                            <br>
                            <p class="equation-title">Equation:</p>
                            <input type="text" class="form-control" id="fit-equation" :value="EQUATION" @keyup.enter="enterEquation" :disabled="!FILETOFIT" @focus="isFocus = !isFocus" @blur="isFocus = !isFocus">
                            <br>
                            <p class="equation-title" v-if="isFocus">Press <strong>[enter]</strong> to change equation</p>
                            <br>
                            <button id="btn-remove-fit" class="btn btn-danger btn-sm" @click="resetFit" :disabled="!FILETOFIT">Remove Fit <span class="glyphicon glyphicon-remove-sign" ></span></button>
                        </div>
                    </div>
                </div>

                <!-- Fit Settings Panel -->
                <div class="panel panel-info" v-if="FILETOFIT">
                    <div class="panel-heading">Fit Settings
                        <button class="btn btn-col btn-default btn-xs pull-right" data-toggle="collapse" href="#collapse-fit-settings"></button>
                    </div>
                    <div id="collapse-fit-settings" class="panel-collapse collapse in">
                        <div class="panel-body">
                            <label>Damping: <span class="damping-output">{{ fitSettings.damping }}</span></label>
                            <input type="range" v-model="fitSettings.damping" min="0.001" max="5" step="0.001" :disabled="!FILETOFIT">

                            <label>Gradient Difference: <span class="damping-output">{{ fitSettings.gradientDifference }}</span></label>
                            <input type="range" v-model="fitSettings.gradientDifference" min="0.1" max="5" step="0.001" :disabled="!FILETOFIT">
                            
                            <label>Max Iterations: <span class="iteration-output">{{ fitSettings.maxIterations }}</span></label>
                            <input type="range" v-model="fitSettings.maxIterations" min="200" max="1000" step="50" :disabled="!FILETOFIT">
                            
                            <label>Error Tolerance: <span class="tolerance-output">{{ fitSettings.errorTolerance }}</span></label>
                            <input type="range" v-model="fitSettings.errorTolerance" min="0.01" max="5" step="0.01" :disabled="!FILETOFIT">
                            <br>
                            <button class="btn btn-warning" @click="resetSettings" :disabled="!FILETOFIT">Default Settings</button>
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
        gradientDifference: 10e-2,
        maxIterations: 200,
        errorTolerance: 10e-3
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
    resetPlot: function() {
      eventBus.$emit('reset-plot');
    },
    setScales: function() {
      eventBus.$emit('set-scales', this.xScale, this.yScale);
    },
    setFitBack: function() {
        this.fit = 'Linear';
    },
    resetSettings: function() {
        console.log("Reset values...");
        this.fitSettings.maxIterations = 200;
        this.fitSettings.damping = 0.001;
        this.fitSettings.errorTolerance = 0.01;
    }
  },
  watch: {
    fit: function() {
      eventBus.$emit('set-fit', this.fit);
    },
    fitSettings: {
        handler: function() {
            eventBus.$emit('set-fit-settings', this.fitSettings);
        },
        deep: true
    }
  },
  created() {
    eventBus.$on('reset-fit', this.resetFit);
    eventBus.$on('reset-scales', this.resetScales);
    eventBus.$on('set-fit-back', this.setFitBack);
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

#btn-reset-scales, #btn-reset-plot, #btn-remove-fit {
  width: 100%;
}

.equation-title {
  color: gray;
  text-align: center;
}

#left-panel-collapse {
    width: 100%;
}

#left-panel-collapse:hover {
    cursor: pointer;
}

#controls-bg {
    background: rgba(0,0,0, 0.02);
}

#control-panel-group {
    padding: 10px;
}

.iteration-output, .damping-output {
    color: steelblue;
}

.tolerance-output {
    color: brown;
}
</style>