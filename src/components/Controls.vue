<template>
  <div id="Controls">
      <div class="selections controls row">
        <h3>Scales:</h3>
        <select class="form-control" v-model="xScale" :disabled="!BUTTONDIS">
        <option v-for="option in xScales">{{option}}</option>
        </select>
        <br>
        <select class="form-control" v-model="yScale" :disabled="!BUTTONDIS">
        <option v-for="option in yScales">{{option}}</option>
        </select>
        <h3>Fit:</h3>
        <select class="form-control" v-model="fit" :disabled="!FILETOFIT">
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
        <button class="btn btn-warning btn-sm" @click="RESETPLOT" :disabled="!BUTTONDIS">Reset Plot <span class="glyphicon glyphicon-refresh"></span></button>
        <br>
        <button class="btn btn-danger btn-sm" @click="resetFit" :disabled="!FILETOFIT">Remove Fit  <span class="glyphicon glyphicon-remove-sign"></span></button>
        </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'Controls',
  props: ["BUTTONDIS", "RESETPLOT", "FILETOFIT", "SETSCALES", "SETFIT"],
  data: function() {
    return {
      xScale: 'X',
      xScales: ["X", "X^2", "LOG(X)"],
      yScale: 'Y',
      yScales: ["Y", "Y^2", "LOG(Y)"],
      fit: 'None',
      fits: ["None", "Guinier", "Porod", "Zimm", "Kratky", "Debye Beuche"]
    }
  },
  methods: {
    resetScales: function() {
      // this.PLOTPARAMS.xScale = 'X';
      // this.PLOTPARAMS.yScale = 'Y';
      this.xScale = 'X';
      this.yScale = 'Y';
    },
    resetFit: function() {
      // this.PLOTPARAMS.fitName = 'None'
      this.SETFIT('None');
    }
  },
  watch: {
    xScale: function() {
      this.SETSCALES(this.xScale, this.yScale);
    },
    yScale: function() {
      this.SETSCALES(this.xScale, this.yScale);
    },
    fit: function() {
      this.SETFIT(this.fit);
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