<template>
  <div id="New1D" class="col-lg-12">
      <div class="container-fluid">
      <div class="col-lg-2">
        <v-panel-group MAINTITLE="Files" PANELTYPE="primary">
            <v-panel PANELTITLE="Fetched Data" PANELTYPE="success">
                Fetched data will go here.
            </v-panel>

            <v-panel PANELTITLE="Uploaded Data" PANELTYPE="success">
                Uploaded data will go here.
            </v-panel>
        </v-panel-group>
      </div>

      <div class="col-lg-10">
        <v-panel PANELTITLE="1D Plot" PANELTYPE="primary">
            Plot will go here.
        </v-panel>
      </div>
</div>
  </div>
</template>

<script>
/* Import Packages */
import * as d3 from 'd3';
import _ from 'lodash';

/* Import Components */
import Panel from './BaseComponents/Panels/Panel.vue';
import PanelGroup from './BaseComponents/Panels/PanelGroup.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../assets/javascript/eventBus';

export default {
    components: {
      'v-panel-group': PanelGroup,
      'v-panel': Panel
    },
    data: function () {
      return {

      }
    },
    computed: {

    },
    methods: {

    },
    watch: {
        scales: {
            handler: function() {
            
        },
        deep: true
        }
    }
  }
</script>

<style scoped>
#New1D {
  position: absolute;
  left: 0;
  right: 0;  
}
</style>
