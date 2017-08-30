<template>
  <div class="Controls">

      <div class="control-panel">

        <div class="controls-bg">
            <div class="panel panel-primary">
                <div :id="titleFormatted+'-main-controls-collapse'" class="panel-heading">{{titleFormatted}} <span class="glyphicon glyphicon-menu-up pull-right"></span></div>
            </div>
            <div :id="titleFormatted+'-control-panel-group'">

                <div class="panel-group">

                <!-- Insert Panel Components Here  -->
                <slot></slot>

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
import { eventBus } from '../../../assets/javascript/eventBus';

import $ from 'jquery';

import ControlPanel from './ControlPanel.vue';

export default {
  name: 'Controls',
  props: {
      MAINTITLE: {
          type: String,
          required: true
      }
  },
  components: {
      'control-panel': ControlPanel
  },
  computed: {
    titleFormatted() {
        return this.MAINTITLE.replace(" ", "-");
    }
  },
  mounted() {
    // Code for Collapsible Panel
    var collapse = '#' + this.titleFormatted + '-main-controls-collapse';
    var collapseGroup = '#' + this.titleFormatted + '-control-panel-group';

    $(collapse).click(function(e) {
        $(collapse).find('span').toggleClass('glyphicon-menu-up glyphicon-menu-down');
        $(collapseGroup).slideToggle(300);
    });
  },
  data: function() {
    return {
        panels: []
        }
    }
}
</script>

<style scoped>
.panel-heading {
    text-align: center;
    cursor: pointer;
}

.controls-bg {
    background: whitesmoke;
}
</style>