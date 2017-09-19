<template>
  <div id="Scales">
    <fieldset :disabled="DISABLE">
        <!-- X Scale Selection -->
        <div class="input-group">
            <span class="input-group-addon">X Scale</span>
            <select ref='x_select' class="form-control" @change="$emit('update-scales', 'X', $event.target.value)">
                <option v-for="scale in xScales">{{scale}}</option>
            </select>
        </div>
        <br>
        <!-- Y Scale Selection -->
        <div class="input-group">
            <span class="input-group-addon">Y Scale</span>
            <select ref='y_select' class="form-control" @change="$emit('update-scales', 'Y', $event.target.value)">
                <option v-for="scale in yScales">{{scale}}</option>
            </select>
        </div>
        <br>
        <button class="btn btn-warning btn-sm btn-block" @click="resetScale"><i class="fa fa-refresh" aria-hidden="true"></i> Reset Scales</button>
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
        resetScale() {
            this.$emit('reset-scales', 'X', 'Y')
        }
    }
  }
</script>

<style scoped>

</style>
