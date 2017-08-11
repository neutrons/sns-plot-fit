<template>
  <div id="plot2D">

    <h1>2D Hexbin Plot</h1>
    
  </div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If files are uploaded in 'fileUpload.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../../assets/javascript/eventBus';

export default {
  name: 'plot2D',
  data: function() {
    return {

    }
  }
}
</script>

<style scoped>

</style>