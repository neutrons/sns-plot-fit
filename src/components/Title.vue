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
            <li v-if="!isOffline">
              <button class="btn btn-success navbar-btn" @click="fetchData">Fetch Data</button>
            </li>
            <li>
              <label class="btn btn-success navbar-btn">
                <i class="fa fa-file" aria-hidden="true"></i> Load Files <input id="file-upload" type="file" style="display: none;" @change="uploadFile($event.target.files)" multiple></label>
            </li>
          </ul>

          <ul id="view-switches" class="nav navbar-nav navbar-right">
            <li id="switch-1D">
              <a href="#1D" @click="switchView('1D')">SANS 1D</a>
            </li>
            <li id="switch-2D">
              <a href="#2D" @click="switchView('2D')">SANS 2D</a>
            </li>
            <li id="switch-Stitch">
              <a href="#Stitch" @click="switchView('Stitch')">Stitch</a>
            </li>
            <li id="switch-TAS" class="active">
              <a href="#TAS" @click="switchView('TAS')">TAS</a>
            </li>
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

import { isOffline } from '../assets/javascript/mixins/isOffline.js';

// Use papa parse to parse csv/tsv files
// Axios to handle HTTP requests
import pp from 'papaparse';
import axios from 'axios';

export default {
  name: 'heading',
  data: function() {
    return {

    }
  },
  mounted() {
    eventBus.$on('fetch-data', this.fetchData);
  },
  mixins: [isOffline],
  methods: {
    fetchData() {
      console.log("Fetching data...");
      // If data is not stored, fetch it, store it, and send data to be plotted
      axios.get('/external/fetch').then(response => {

        var files = response.data;

        var temp1D = [];
        var temp2D = [];
        var vm = this;

        for (let i = 0, len = files.length; i < len; i++) {
          var temp1DFiles = [];
          var temp2DFiles = [];
          var jobTitle = files[i].job_title;
          var jobModified = files[i].date_modified;

          files[i].results.forEach(function(item) {
            
            if (vm.dataType(item.url) === '1D') {
              // console.log("1D Item", {url: url, group: group, fileName: name});
              temp1D.push({
                id: item.id,
                filename: item.filename,
                url: item.url,
                jobTitle: jobTitle,
                dateModified: jobModified
              });

            } else if (vm.dataType(item.url) === '2D') {
              // console.log("2D Item", {url: url, group: group, fileName: name});
              temp2D.push({
                id: item.id,
                filename: item.filename,
                url: item.url,
                jobTitle: jobTitle,
                dateModified: jobModified
              });

            } else {
              let errorMsg = "<strong>Error! </strong>" + item.url + " is not a supported type.<br/>Make sure the file ends in <em>'Iq.txt'</em> or <em>'Iqxy.dat'</em>";
              eventBus.$emit('error-message', errorMsg, 'danger');
            }
          });

        }

        // Add Fetched File List(s) to Global Store
        if (temp1D.length > 0) this.$store.commit('addFetched1DFiles', temp1D);
        if (temp2D.length > 0) this.$store.commit('addFetched2DFiles', temp2D);
      }).catch(function (err) {
          console.log(err.message);
          eventBus.$emit('error-message', err.message, 'danger');
      })
    },
    uploadFile(files) {

      // CODE TO UPLOAD DATA FILES //
      var vm = this;

      var temp1D = [];
      var temp2D = [];

      for (var i = 0, len = files.length; i < len; i++) {
        // loadFiles(files[i]);
        let url = files[i].name;
        let blob = files[i];

        if (vm.dataType(url) === '1D') {
          // console.log("1D Item", {url: url, group: group, fileName: name});
          let filename = url.substr(0, url.lastIndexOf('.txt')) || url;
          temp1D.push({
            url: url,
            filename: filename,
            blob: blob
          });

        } else if (vm.dataType(url) === '2D') {
          // console.log("2D Item", {url: url, group: group, fileName: name});
          let filename = url.substr(0, url.lastIndexOf('.dat')) || url;
          temp2D.push({
            url: url,
            filename: filename,
            blob: blob
          });

        } else {
          // error, don't read for now
          let errorMsg = "<strong>Error! </strong>" + url + " is not a supported type.<br/>Make sure the file ends in <em>'Iq.txt'</em> or <em>'Iqxy.dat'</em>";
          eventBus.$emit('error-message', errorMsg, 'danger');
        }
      }

      if (temp1D.length > 0) this.$store.commit('addUploaded1DFiles', temp1D);
      if (temp2D.length > 0) this.$store.commit('addUploaded2DFiles', temp2D);

      document.getElementById("file-upload").value = '';
      // END OF CODE TO UPLOAD FILES //
    },
    dataType(fname) {
      if (/.*Iq.txt$/.exec(fname)) {
        // File matches 1D data
        // console.log("Is 1D:", fname);
        return '1D';
      } else if (/.*.dat$/.exec(fname)) {
        // File matches for 2D data
        // console.log("Is 2d:", fname);
        return '2D';
      } else {
        // File doesn't match for either 1D or 2D, throw error message
        return false;
      }
    },
    switchView(view) {
      var views = document.getElementById("view-switches").children;
      for (let i = 0, len = views.length; i < len; i++) {
        if (views[i].id === "switch-" + view) {
          views[i].classList.add('active');
        } else {
          views[i].classList.remove('active');
        }
      }

      // console.log("View switched to: ", view);
      this.$emit('switch-plot-component', view);
    }
  }
}
</script>

<style scoped>
#title {
  background: white;
  border: none;
  box-shadow: 0px 1px 10px gainsboro;
}


/* Link Styles for Switching Component Views */

#view-switches li {
  margin: 0px;
  text-align: center;
}

#view-switches a {
  transition: all 0.5s ease;
  color: #00672c;
}

#view-switches a:hover {
  background: #00672c;
  color: white;
}

#view-switches li.active a {
  color: white;
}

#menu-buttons {
  text-align: center;
  background-color: rgb(220, 220, 220);
  padding: 0px 0px 0px 10px;
  border-left: 3px solid #cccccc;
}

#menu-buttons .btn {
  border-radius: 0px;
  margin-right: 10px;
}
</style>