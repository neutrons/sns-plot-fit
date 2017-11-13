<template>
  <div id="app-container" class="container-fluid">
      
      <div id="error-container"></div>
      
      <app-title></app-title>

      <transition name="fade" appear>
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </transition>

      <app-point-modal></app-point-modal>
  </div>
</template>

<script>
import $ from 'jquery';

/* Import Components */
import Title from './components/Title.vue';
import PointModal from './components/BaseComponents/PointModal.vue';

// The eventBus serves as the means to communicating between components.
// e.g., If scales are reset in 'Controls.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from './assets/javascript/eventBus';

export default {
  name: 'app',
  components: {
    'app-title': Title,
    'app-point-modal': PointModal,
  },
  data: function () {
    return {
      errorCount: 0,
    }
  },
  created() {
    // Listen for error messages
    eventBus.$on('error-message', this.generateError);
  },
  methods: {
    generateError(errorMSG, type) {
      document.getElementById("error_" + this.errorCount) === null ? this.errorCount = 0 : this.errorCount += 1;

      let newDiv = document.createElement("div");
      let timer = this.errorCount === 0 ? 5000 : 5000+(this.errorCount*1000);
      
      newDiv.innerHTML = '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + errorMSG;
      newDiv.classList.add("error", "alert", ("alert-" + type), "alert-dismissable", "fade", "in")

      let tempID = "error_" + this.errorCount;
      newDiv.id = tempID;
      
      // add the newly created element and its content into the DOM 
      document.getElementById("error-container").append(newDiv);

      setTimeout(function() {
          $("#"+tempID).fadeTo(500, 0).slideUp(500, function(){
          $(this).remove(); 
        });
      }, timer);

    }
  }
}
</script>

<style lang="less">
/* Set Font-Awesome Globally for all sub-components  */
@import '../node_modules/font-awesome/css/font-awesome.min.css';
@import './assets/styles/less/responsiveText.less';
@import './assets/styles/less/mediaQueries.less';
@import './assets/styles/less/app-styles.less';
</style>
