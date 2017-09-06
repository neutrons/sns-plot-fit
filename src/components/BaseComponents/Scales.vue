<template>
  <div id="Scales">
    <fieldset :disabled="DISABLE">
        <!-- X Scale Selection -->
        <div class="input-group">
            <span class="input-group-addon">X Scale</span>
            <select class="form-control" v-model="xScale" @change="setScales">
                <option v-for="scale in xScales">{{scale}}</option>
            </select>
        </div>
        <br>
        <!-- Y Scale Selection -->
        <div class="input-group">
            <span class="input-group-addon">Y Scale</span>
            <select class="form-control" v-model="yScale" @change="setScales">
                <option v-for="scale in yScales">{{scale}}</option>
            </select>
        </div>
        <br>
        <button class="btn btn-warning btn-sm btn-block" @click="resetScales"><i class="fa fa-refresh" aria-hidden="true"></i> Reset Scales</button>
    </fieldset>
</div>
</template>

<script>
export default {
    name: 'Scales',
    props: {
        DISABLE: {
            type: Boolean,
            default: false,
            required: true
        }
    },
    data: function () {
      return {
          xScale: 'X',
          yScale: 'Y'
      }
    },
    computed: {
      xScales() {
        let tempScales = this.$store.getters.getXScales;
        tempScales = Object.keys(tempScales);
        
        return tempScales;
      },
      yScales() {
        let tempScales = this.$store.getters.getYScales;
        tempScales = Object.keys(tempScales);
        
        return tempScales;
      }
    },
    methods: {
        resetScales() {
            this.xScale = 'X';
            this.yScale = 'Y';
            this.$emit('update-scales', this.xScale, this.yScale);
        },
        setScales() {
            //this.$emit('update-scales', this.xScale, this.yScale)
            this.$emit('update-scales', this.xScale, this.yScale);
        }
    }
  }
</script>

<style scoped>

</style>
