<template>
  <div id="Controls">

      <div id="control-panel">

        <div id="controls-bg">
            <div class="panel panel-default">
                <div id="control-panel-collapse" class="panel-heading"> Controls <span class="glyphicon glyphicon-menu-up pull-right"></span></div>
            </div>
            <div id="control-panel-group">

                <div class="panel-group">

                <!-- Scales Panel -->
                <div class="panel panel-info">
                    <div class="panel-heading">
                        <a class="panel-title" data-toggle="collapse" href="#collapse-scales">Scales</a>
                    </div>
                    <div id="collapse-scales" class="panel-collapse collapse in">
                        <div class="panel-body">
                            <fieldset :disabled="!BUTTONDIS">
                                <!-- X Scale Selection -->
                                <div class="input-group">
                                    <span class="input-group-addon">X Scale</span>
                                    <select class="form-control" v-model="xScale" @change="setScales">
                                        <option v-for="option in xScales">{{option}}</option>
                                    </select>
                                </div>
                                
                                <!-- Y Scale Selection -->
                                <div class="input-group">
                                    <span class="input-group-addon">Y Scale</span>
                                    <select class="form-control" v-model="yScale" @change="setScales">
                                        <option v-for="option in yScales">{{option}}</option>
                                    </select>
                                </div>
                                
                                <button id="btn-reset-scales" class="btn btn-warning btn-sm" @click="resetScales">Reset Scales <span class="glyphicon glyphicon-refresh"></span></button>
                            </fieldset>
                        </div>
                    </div>
                </div>

                <!-- X and Y Transformation Panel -->
                <div class="panel panel-info">
                    <div class="panel-heading">
                        <a class="panel-title" data-toggle="collapse" href="#collapse-transformations">Transformations</a>
                    </div>
                    <div id="collapse-transformations" class="panel-collapse collapse">
                        <div class="panel-body">
                            <fieldset :disabled="!BUTTONDIS">
                                <div class="input-group">
                                    <span class="input-group-addon">X</span>
                                    <input type="text" class="form-control" :value="XTRANS" id="x-transform" @keyup.enter="enterTransformations" @focus="isTransFocus = !isTransFocus" @blur="isTransFocus = !isTransFocus">
                                </div>

                                <div class="input-group">
                                    <span class="input-group-addon">Y</span>
                                    <input type="text" class="form-control" :value="YTRANS" id="y-transform" @keyup.enter="enterTransformations" @focus="isTransFocus = !isTransFocus" @blur="isTransFocus = !isTransFocus">
                                </div>
                                
                                <p class="transformation-title" v-if="isTransFocus">Press <strong>[enter]</strong> to change transformations</p>
                                <div id="transformation-error"></div>
                                <button id="btn-reset-transformation" class="btn btn-warning btn-sm" @click="resetTransformation">Reset <span class="glyphicon glyphicon-refresh"></span></button>
                            </fieldset>
                        </div>
                    </div>
                </div>

                <!-- Fitting Selections Panel -->
                <div class="panel panel-info">
                    <div class="panel-heading">
                        <a class="panel-title" data-toggle="collapse" href="#collapse-fit">Fit</a>
                    </div>
                    <div id="collapse-fit" class="panel-collapse collapse">
                        <div class="panel-body">
                            <!-- Fit Type Selections -->
                            <div class="input-group">
                                <span class="input-group-addon">Fit Type</span>
                                <select class="form-control" v-model="fit" :disabled="!FILETOFIT">
                                    <option v-for="fit in FITS">{{fit.fit}}</option>
                                </select>
                            </div>

                            <!-- Equation Input/Editer-->
                            <div class="input-group">
                                <span class="input-group-addon">Equation</span>
                                <input type="text" class="form-control" id="fit-equation" :value="EQUATION" @keyup.enter="enterEquation" :disabled="!FILETOFIT || fit === 'None'" @focus="isFocus = !isFocus" @blur="isFocus = !isFocus">
                            </div>
                            <p class="equation-title" v-if="isFocus">Press <strong>[enter]</strong> to change equation</p>

                            <!-- Coefficients Input/Editer-->
                            <fieldset :disabled="!FILETOFIT">
                                <div v-if="isCoefficients">
                                    <div class="coefficients-input input-group" v-for="(coef, key) in coefficients">
                                        <span class="input-group-addon">{{ key }}</span>
                                        <input type="text" class="form-control" :id="key + '-input'" :value="coef" @keyup.enter="enterCoefficients">
                                    </div>
                                </div>
                                <button id="btn-remove-fit" class="btn btn-danger btn-sm" @click="resetFit">Remove Fit <span class="glyphicon glyphicon-remove-sign" ></span></button>
                            </fieldset>
                        </div>
                    </div>
                </div>

                <!-- Fit Settings Panel -->
                <div class="panel panel-info">
                    <div class="panel-heading">
                        <a class="panel-title" data-toggle="collapse" href="#collapse-fit-settings">Levenberg–Marquardt Parameters</a>
                    </div>
                    <div id="collapse-fit-settings" class="panel-collapse collapse">
                        <div class="panel-body">
                            <fieldset :disabled="!FILETOFIT">
                                <label>Damping: <span class="damping-output">{{ fitSettings.damping }}</span></label>
                                <input type="range" v-model.number="fitSettings.damping" min="0.001" max="10" step="0.001" @mouseup="setFitSettings" @keyup="setFitSettings" @touchend="setFitSettings" >

                                <label>Gradient Difference: <span class="iteration-output">{{ fitSettings.gradientDifference }}</span></label>
                                <input type="range" v-model.number="fitSettings.gradientDifference" min="0.01" max="1" step="0.01" @mouseup="setFitSettings" @keyup="setFitSettings" @touchend="setFitSettings" >
                                
                                <label>Max Iterations: <span class="iteration-output">{{ fitSettings.maxIterations }}</span></label>
                                <input type="range" v-model.number="fitSettings.maxIterations" min="100" max="10000" step="100" @mouseup="setFitSettings" @keyup="setFitSettings" @touchend="setFitSettings" >
                                
                                <label>Error Tolerance: <span class="tolerance-output">{{ fitSettings.errorTolerance }}</span></label>
                                <input type="range" v-model.number="fitSettings.errorTolerance" min="0.001" max="1" step="0.001" @mouseup="setFitSettings" @keyup="setFitSettings" @touchend="setFitSettings" >
                                <br>
                                <button id="btn-reset-fit-settings" class="btn btn-warning btn-sm" @click="resetSettings">Default Settings <span class="glyphicon glyphicon-remove-sign" ></span></button>
                            </fieldset>
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
import { eventBus } from '../../assets/javascript/eventBus';
import fd from '../../assets/javascript/fitData';
import * as _ from 'lodash';

export default {
  name: 'Controls',
  props: ["BUTTONDIS", "FILETOFIT", "EQUATION", "XTRANS", "YTRANS", "FITS"],
  data: function() {
    return {
      isFocus: false,
      isTransFocus: false,
      coefficients: {},
      xScale: 'X',
      xScales: ["X", "X^2", "Log(X)"],
      yScale: 'Y',
      yScales: ["Y", "Y^2", "Log(Y)"],
      fit: 'Linear',
      fitSettings: {
    	damping: 0.001,
        initialValues: [],
        gradientDifference: 0.1,
        maxIterations: 100,
        errorTolerance: 0.001
      }
    }
  },
  computed: {
      isCoefficients: function() {
          return Object.keys(this.coefficients).length > 0;
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
    enterTransformations: function() {
    
        let newXTrans = document.getElementById('x-transform').value;
        let newYTrans = document.getElementById('y-transform').value;
        if(fd.isSymbols([newXTrans, newYTrans])) {
            console.log("Hey wrong!");

            document.getElementById('transformation-error').innerHTML = 
                '<div class="alert alert-danger alert-dismissable">\
                <a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>\
                <strong>Error:</strong> Incorrect input.\
                    <ol>\
                        <li>Make sure to enter an appropriate transformation (e.g., "x+2")</li>\
                        <li>Check case, "x" <em>must</em> be lowercase</li>\
                        <li>No additional variables (e.g., "x+c" is incorrect)</li>\
                    </ol>\
                </div>';
        } else {
            document.getElementById('transformation-error').innerHTML = "";
            console.log("Changing transformations...");
            console.log("New transformations X", newXTrans);
            console.log("New transformation y", newYTrans);
            eventBus.$emit('set-transformations', newXTrans, newYTrans);
        }
    },
    enterCoefficients: function() {
        console.log("Entering coefficients...");
        let c = {};
        for(let key in this.coefficients) {
            let val = document.getElementById(key+"-input").value;
            c[key] = +val;
        }

        eventBus.$emit("coefficients-updated", _.cloneDeep(c));
    },
    updateCoefficients: function(coeff) {
        this.coefficients = coeff;
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
        this.fitSettings.maxIterations = 100;
        this.fitSettings.damping = 0.001;
        this.fitSettings.errorTolerance = 0.001;
        this.fitSettings.gradientDifference = 0.1;
        eventBus.$emit('set-fit-settings', _.cloneDeep(this.fitSettings)); // clone object or it passes fitSettings by reference not value
    },
    setFitSettings: function() {
        console.log(this.fitSettings);
        eventBus.$emit('set-fit-settings', _.cloneDeep(this.fitSettings)); // clone object or it passes fitSettings by reference not value
    },
    resetTransformation: function() {
        console.log("Resetting transformations...");
        eventBus.$emit('reset-transformation');
    }
  },
  watch: {
    fit: function() {
        if(this.fit === 'None') this.coefficients = {};
        eventBus.$emit('set-fit', this.fit);
    }
  },
  created() {
    eventBus.$on('reset-fit', this.resetFit);
    eventBus.$on('reset-scales', this.resetScales);
    eventBus.$on('set-fit-back', this.setFitBack);
    eventBus.$on('set-fit-settings-back', this.resetSettings);

    // Listen to emit from plotCurrentData.js
    eventBus.$on('update-coefficients', this.updateCoefficients);
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

#btn-reset-scales, #btn-remove-fit, #btn-reset-fit-settings, #btn-reset-transformation {
  width: 100%;
}

.equation-title, .transformation-title {
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
    margin-bottom: 15px;
}

#control-panel-group {
    background: rgba(0,0,0, 0.02);
    height: 100%;
    padding: 10px 0px;
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

.input-group {
    margin-bottom: 10px;
    width: 100%;
}

.input-group-addon {
    width: 35%;
}
</style>