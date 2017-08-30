<template>
  <div id="Files">

      <div id="file-panel">

        <div id="files-bg">
            <div class="panel panel-primary">
                <div :id="titleFormatted+'-main-file-collapse'" class="panel-heading">{{MAINTITLE}} <span class="glyphicon glyphicon-menu-up pull-right"></span></div>
            </div>
            <div :id="titleFormatted+'-file-panel-group'">

                <div class="panel-group">

                <!-- Insert File Panel Components Here  -->
                <slot></slot>

                </div>
            </div>
        </div>
    </div>

  </div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If files are uploaded in 'fileUpload.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../../assets/javascript/eventBus';
import $ from 'jquery';

export default {
  name: 'Files',
  components: {

  },
  props: {
      MAINTITLE: {
          type: String,
          required: true
      }
  },
  data: function () {
    return {
      panels: []
    }
  },
  computed: {
    titleFormatted() {
        return this.MAINTITLE.replace(" ", "-");
    }
  },
  mounted() {
    // Code for Collapsible Panel
    var collapse = '#' + this.titleFormatted + '-main-file-collapse';
    var collapseGroup = '#' + this.titleFormatted + '-file-panel-group';

    $(collapse).click(function(e) {
        $(collapse).find('span').toggleClass('glyphicon-menu-up glyphicon-menu-down');
        $(collapseGroup).slideToggle(300);
    });
  }
}
</script>

<style scoped>
.panel-heading {
    text-align: center;
    cursor: pointer;
}

.files-bg {
    background: whitesmoke;
}
</style>