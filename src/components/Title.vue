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
          <img src="../assets/ornl_logo.png" class="navbar-brand">
        </div>

      <div class="collapse navbar-collapse" id="navbarElements">
        <ul id="menu-buttons" class="nav navbar-nav navbar-right">
          <li><button class="btn btn-primary navbar-btn" @click="fetchData"><i class="fa fa-arrow-circle-o-down" aria-hidden="true"></i> Fetch Data</button></li>
          <li><label class="btn btn-primary navbar-btn"><i class="fa fa-file" aria-hidden="true"></i> Load Files <input id="file-upload" type="file" style="display: none;" @change="uploadFile($event.target.files)" multiple></label></li>
        </ul>

        <ul id="view-switches" class="nav navbar-nav navbar-right">
          <li id="switch-1D"><a href="#1D" @click="switchView('1D')">1D</a></li>
          <li id="switch-2D"><a href="#2D" @click="switchView('2D')">2D</a></li>
          <li id="switch-Stitch" class="active"><a href="#Stitch" @click="switchView('Stitch')">Stitch</a></li>
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
    },
    switchView: function(view) {
      var views = document.getElementById("view-switches").children;
      for(let i = 0, len = views.length; i < len; i++) {
        if( views[i].id === "switch-"+view) {
          views[i].classList.add('active');
        } else {
          views[i].classList.remove('active');
        }
      }

      console.log("View switched to: ", view);
      eventBus.$emit('switch-plot-component', view);
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
  border: none;
  border-bottom: 1px solid gainsboro;
}

/* Link Styles for Switching Component Views */
#view-switches li {
  margin: 0px 10px;
  text-align: center;
}
#view-switches a {
  color: #00672c;
}

#view-switches a:hover {
  background: #00672c;
  color: white;
}

#view-switches li.active a{
  color: white;
}

#menu-buttons .btn {
  border-radius: 0px;
  margin-right: 10px;
}
</style>