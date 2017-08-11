<template>
  <div class="container-fluid">

    <nav id="title" class="navbar navbar-default">
      <div class="container-fluid">
        <div class="navbar-header">
          <a class="navbar-brand" href="#"><img src="../assets/ornl_logo.png"></a>
        </div>

        <ul class="nav navbar-nav">
          <li @click="switchPlots('main1D')">1D Plot</li>
          <li @click="switchPlots('main2D')">2D Plot</li>
        </ul>

        <ul class="nav navbar-nav navbar-right">
          <li><button class="btn btn-primary btn-fetch" @click="fetchData">Fetch Data <span class="glyphicon glyphicon-download"></span></button></li>
          <li><label class="btn btn-primary btn-upload">Load Files <span class="glyphicon glyphicon-file"></span> <input id="file-upload" type="file" style="display: none;" @change="uploadFile" multiple></label></li>
        </ul>
      </div>
    </nav>
    
  </div>
</template>

<script>
// The eventBus serves as the means to communicating between components.
// e.g., If files are uploaded in 'fileUpload.vue', an event is emitted
//       and the event is then 'caught' in 'Main.vue'
import { eventBus } from '../assets/javascript/eventBus';

export default {
  name: 'menu',
  data: function() {
    return {

    }
  },
  methods: {
    fetchData: function() {
      eventBus.$emit('fetch-data');
    },
    uploadFile: function() {
      let files = document.getElementById("file-upload").files;
      //console.log("Files:", files[0]);
      eventBus.$emit('upload-file', files);
    },
    switchPlots: function(plotType) {
      console.log("Switching plots...", plotType);
      eventBus.$emit('switch-plot-component', plotType);
    }
  }
}
</script>

<style scoped>

#title {
  background: white;
  height: auto;
  border: none;
  border-bottom: 1px solid gainsboro;
  padding: 0px 10px;
}

#title ul{
  margin: auto;
  margin-top: 20px;
}

#title li {
  margin-right: 20px;
  height: 100%;
}

.navbar-brand {
  height: auto;
}
</style>