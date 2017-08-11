<template>
  <div id="heading" class="container-fluid">

    <nav id="title" class="navbar navbar-default">
      <div id="menu" class="container-fluid">
        <div class="navbar-header">
          <img src="../assets/ornl_logo.png">
        </div>


        <ul class="nav navbar-nav navbar-right">
          <li><button class="btn btn-default btn-fetch" @click="fetchData">Fetch Data <span class="glyphicon glyphicon-download"></span></button></li>
          <li><label class="btn btn-default btn-upload">Load Files <span class="glyphicon glyphicon-file"></span> <input id="file-upload" type="file" style="display: none;" @change="uploadFile" multiple></label></li>
        </ul>

        <!-- <ul id="toggle-plots" class="nav navbar-nav navbar-right">
          <li @click="switchPlots('1D')">1D Plot</li>
          <li @click="switchPlots('2D')">2D Plot</li>
        </ul> -->

        <div id="toggle-switch" class="nav navbar-nav navbar-right">
          <label class="toggle-label">1D</label>
          <label class="switch">
            <input type="checkbox" v-model="plotCheck">
            <span class="slider round"></span>
          </label>
          <label class="toggle-label">2D</label>
        </div>
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
  name: 'heading',
  data: function() {
    return {
        plotCheck: false
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
    }
  },
  watch: {
    plotCheck: function() {
      eventBus.$emit('switch-plot-component', this.plotCheck ? '2D' : '1D');
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
  padding: 10px;
}

#menu ul {
  margin: 10px auto;
}

#menu li {
  margin-right: 20px;
  height: 100%;
}


/* Switch Styles  */
#toggle-switch {
  display: flex;
  vertical-align: center;
  margin: 10px 25px;
}

.toggle-label {
  padding: 0px 5px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {display:none;}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: green;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 5px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(18px);
  -ms-transform: translateX(18px);
  transform: translateX(18px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>