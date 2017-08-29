<template>
  <div id="heading" class="container-fluid">

    <nav id="title" class="navbar navbar-default">
      <div id="menu" class="container-fluid">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbarElements">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>                        
          </button>
          <img src="../assets/ornl_logo.png">
        </div>

      <div class="collapse navbar-collapse" id="navbarElements">
        <ul class="nav navbar-nav navbar-right">
          <li>
            <div id="toggle-switch">
              <label class="toggle-label">1D</label>
              <label class="switch">
                <input type="checkbox" v-model="plotCheck">
                <span class="slider round"></span>
              </label>
              <label class="toggle-label">2D</label>
            </div>
          </li>
          <li><button class="btn btn-primary btn-fetch" @click="fetchData"><span class="glyphicon glyphicon-download"></span> Fetch Data</button></li>
          <li><label class="btn btn-primary"><span class="glyphicon glyphicon-file"></span> Load Files <input id="file-upload" type="file" style="display: none;" @change="uploadFile($event.target.files)" multiple></label></li>
        </ul>
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

// Use papa parse to parse csv/tsv files
// Axios to handle HTTP requests
import pp from 'papaparse';
import axios from 'axios';

export default {
  name: 'heading',
  data: function() {
    return {
        plotCheck: false
    }
  },
  created() {
    // Listen for event from Title.vue to drag 'n drop files
    eventBus.$on('upload-files', this.uploadFile);
  },
  methods: {
    fetchData: function() {
      var url = document.getElementById("urlid").getAttribute("data-urlid");
      var files = JSON.parse(url);

      var temp1D = [];
      var temp2D = [];
      var vm = this;

      for (let i = 0, len = files.length; i < len; i++) {
          var temp1DFiles = [];
          var temp2DFiles = [];

          files[i].results.forEach(function(item) {
            
            if( vm.dataType(item.url) === '1D') {
              // console.log("1D Item", {url: url, group: group, fileName: name});
              temp1DFiles.push({  id: item.id, filename: item.filename, url: item.url});

            } else if ( vm.dataType(item.url) === '2D') {
              // console.log("2D Item", {url: url, group: group, fileName: name});
              temp2DFiles.push({  id: item.id, filename: item.filename, url: item.url});

            } else {
              let errorMsg = "<strong>Error! </strong>" + item.url + " is not a supported type.<br/>Make sure the file ends in <em>'Iq.txt'</em> or <em>'Iqxy.dat'</em>";
              eventBus.$emit('error-message', errorMsg);
            }
          });
          
          if(temp1DFiles.length > 0) {
            temp1D.push({jobID: files[i].job_id,
                      jobTitle: files[i].job_title,
                      dateModified: files[i].date_modified,
                      files: temp1DFiles});
          }
          
          if(temp2DFiles.length > 0) {
            temp2D.push({jobID: files[i].job_id,
                        jobTitle: files[i].job_title,
                        dateModified: files[i].date_modified,
                        files: temp2DFiles});
          }
      
      }

      if(temp1D.length > 0) eventBus.$emit('add-get-1D', temp1D);
      if(temp2D.length > 0) eventBus.$emit('add-get-2D', temp2D);
      
    },
    uploadFile: function(files) {

      // CODE TO UPLOAD DATA FILES //
        var vm = this;

        var temp1D = [];
        var temp2D = [];

        for (var i = 0, len = files.length; i < len; i++) {         
          // loadFiles(files[i]);
          let url = files[i].name;
          let blob = files[i];

          if( vm.dataType(url) === '1D') {
              // console.log("1D Item", {url: url, group: group, fileName: name});
              let filename = url.substr(0, url.lastIndexOf('.txt')) || url;
              temp1D.push( {url: url, filename: filename, blob: blob});

            } else if ( vm.dataType(url) === '2D') {
              // console.log("2D Item", {url: url, group: group, fileName: name});
              let filename = url.substr(0, url.lastIndexOf('.dat')) || url;
              temp2D.push( {url: url, filename: filename, blob: blob});

            } else {
              // error, don't read for now
              let errorMsg = "<strong>Error! </strong>" + url + " is not a supported type.<br/>Make sure the file ends in <em>'Iq.txt'</em> or <em>'Iqxy.dat'</em>";
              eventBus.$emit('error-message', errorMsg);
            }
        }

        if(temp1D.length > 0) eventBus.$emit('add-uploaded-1D', temp1D);
        if(temp2D.length > 0) eventBus.$emit('add-uploaded-2D', temp2D);

        document.getElementById("file-upload").value = '';
        // END OF CODE TO UPLOAD FILES //
    },
    dataType: function(fname) {
      if (/.*Iq.txt$/.exec(fname)) {
        // File matches 1D data
        return '1D';
      } else if (/.*.dat$/.exec(fname)) {
        // File matches for 2D data
        return '2D';
      } else {
        // File doesn't match for either 1D or 2D, throw error message
        return false;
      }
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
  margin: 5px 25px;
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
  -webkit-transition: all 1.5s;
  transition: all 1.5s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 5px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: all 1.5s;
  transition: all 1.5s;
}

input:checked + .slider {
  background-color: #5091cd;
}

input:focus + .slider {
  box-shadow: 0 0 1px #5091cd;
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