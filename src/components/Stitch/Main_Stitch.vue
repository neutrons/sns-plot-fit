<template>
  <div id="mainStitch" class="col-lg-12">
    <div class="container-fluid">

        <!-- Main component for Stitch goes here  -->
        <stitch-main>
                <div class="col-md-2">
                    <app-files MAINTITLE="Files">
                        <app-file-panel PANELTITLE="GET Files"></app-file-panel>
                        <app-file-panel PANELTITLE="Uploaded Files"></app-file-panel>
                    </app-files>

                    <app-controls MAINTITLE="Controls">
                        <app-control-panel PANELTITLE="Scales"></app-control-panel>
                        <app-control-panel PANELTITLE="Transformations"></app-control-panel>
                    </app-controls>
                </div>

                <div class="col-md-10">
                    <app-plot MAINTITLE="Stitch Plot">
                        <p>Some plot content</p>
                    </app-plot>
                </div>
        </stitch-main>
      <p>Content here: {{value}}</p>
    </div>
  </div>
</template>

<script>
import Main from '../BaseComponents/Main.vue';

/* Import Control Elements */
import Controls from '../BaseComponents/Controls/Controls.vue';
import ControlPanel from '../BaseComponents/Controls/ControlPanel.vue';

/* Import File Elements */
import Files from '../BaseComponents/Files/Files.vue';
import FilePanel from '../BaseComponents/Files/FilePanel.vue';

/* Import Plot Elements */
import Plot from '../BaseComponents/Plot/Plot.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

export default {
    name: 'mainStitch',
    components: {
      'stitch-main': Main,
      'app-controls': Controls,
      'app-control-panel': ControlPanel,
      'app-plot': Plot,
      'app-files': Files,
      'app-file-panel': FilePanel
    },
    data: function () {
      return {
      }
    },
    computed: {
        value() {
            return this.$store.state.name;
        }
    }
  }
</script>

<style scoped>

</style>
