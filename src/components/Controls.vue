<template>
  <div id="Controls">
      <div class="selections controls row">
        <h3>Scales:</h3>
        <select class="form-control" v-model="PLOTPARAMS.xScale" :disabled="!BUTTONDIS">
        <option v-for="option in xScales">{{option}}</option>
        </select>
        <br>
        <select class="form-control" v-model="PLOTPARAMS.yScale" :disabled="!BUTTONDIS">
        <option v-for="option in yScales">{{option}}</option>
        </select>
        <h3>Fit:</h3>
        <select class="form-control" v-model="PLOTPARAMS.fitName" :disabled="!PLOTPARAMS.fileToFit">
        <option v-for="fit in fits">{{fit}}</option>
        </select>
        <br>
        <label>Equation:</label>
        <input type="text" class="form-control" id="fit-equation">
        <label>a:</label>
        <input type="text" class="form-control">
        <label>b:</label>
        <input type="text" class="form-control">
        <h3>Reset:</h3>
        <div class="btn-group-vertical">
        <button class="btn btn-warning btn-sm" @click="resetScales" :disabled="!BUTTONDIS">Reset Scales <span class="glyphicon glyphicon-refresh"></span></button>
        <br>
        <button class="btn btn-danger btn-sm" @click="resetFit" :disabled="!BUTTONDIS">Remove Fit  <span class="glyphicon glyphicon-remove-sign"></span></button>
        <br>
        <button class="btn btn-warning btn-sm" @click="RESETPLOT" :disabled="!BUTTONDIS">Reset Plot <span class="glyphicon glyphicon-refresh"></span></button>
        </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'Controls',
  props: ["BUTTONDIS", "RESETPLOT", "PLOTPARAMS"],
  data: function() {
    return {
      xScales: ["X", "X^2", "LOG(X)"],
      yScales: ["Y", "Y^2", "LOG(Y)"],
      fits: ["None", "Guinier", "Porod", "Zimm", "Kratky", "Debye Beuche"]
    }
  },
  methods: {
    resetScales: function() {
      this.PLOTPARAMS.xScale = 'X';
      this.PLOTPARAMS.yScale = 'Y';
    },
    resetFit: function() {
      this.PLOTPARAMS.fitName = 'None'
    }
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

</style>