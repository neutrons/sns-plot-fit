<template>
<div id="Controls-2d">

    <div id="control-panel-2d">

        <div class="controls-bg">
            <div class="panel panel-default">
                <div id="control-panel-collapse-2d" class="panel-heading"> Controls <span class="glyphicon glyphicon-menu-up pull-right"></span></div>
            </div>
            <div id="control-panel-group-2d">

                <div class="panel-group">

                    <!-- 2D Settings Panel -->
                    <div class="panel panel-info">
                        <div class="panel-heading">
                            <a class="panel-title" data-toggle="collapse" href="#collapse-settings-2d">Settings</a>
                        </div>
                        <div id="collapse-settings-2d" class="panel-collapse collapse in">
                            <div class="panel-body">
                                <label>Bin Size: <span class="damping-output">{{ hexSettings.binSize }}</span></label>
                                <input type="range" v-model.number="hexSettings.binSize" min="5" max="10" step="1" :disabled="!BUTTONDIS" @mouseup="setHexSettings"
                                    @keyup="setHexSettings" @touchend="setHexSettings">

                                <br>

                                <!-- Intensity Transfomration Selection -->
                                <div class="input-group">
                                    <span class="input-group-addon">Intensity Scale</span>
                                    <select class="form-control" v-model="hexSettings.intensityTransformation" :disabled="!BUTTONDIS">
                                        <option>Log</option>
                                        <option>Linear</option>
                                    </select>
                                </div>

                                <button id="btn-reset-hex-settings" class="btn btn-warning btn-sm" @click="resetSettings" :disabled="!BUTTONDIS">Reset <span class="glyphicon glyphicon-refresh"></span></button>
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
import * as _ from 'lodash';

export default {
  name: 'Controls-2d',
  props: ["BUTTONDIS"],
  data: function() {
    return {
      hexSettings: {
          intensityTransformation: 'Log',
          binSize: 10
      }
    }
  },
  created() {

  },
  methods: {
    resetSettings: function() {
      this.hexSettings = {
          intensityTransformation: 'Log',
          binSize: 10
      };
    },
    setHexSettings: function() {
      eventBus.$emit('set-scales', this.hexSettings);
    }
  },
  watch: {
    hexSettings: function() {
        
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

#btn-reset-hex-settings {
  width: 100%;
}

.equation-title, .transformation-title {
  color: gray;
  text-align: center;
}

#control-panel-collapse-2d {
    width: 100%;
    padding: 7px 5px;
}

#control-panel-collapse-2d:hover {
    cursor: pointer;
}

.controls-bg {
    margin-bottom: 15px;
}

#control-panel-group-2d {
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