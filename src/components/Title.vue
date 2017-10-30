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
              <button class="btn btn-success navbar-btn" @click="fetchFiles">Fetch Data</button>
            </li>
            <li>
              <v-file-upload></v-file-upload>
            </li>
          </ul>

          <ul id="view-switches" class="nav navbar-nav navbar-right">
            <li id="switch-SANS1D" class="active">
              <a href="#SANS1D" @click="switchView('SANS1D')">SANS 1D</a>
            </li>
            <li id="switch-SANS2D">
              <a href="#SANS2D" @click="switchView('SANS2D')">SANS 2D</a>
            </li>
            <li id="switch-Stitch">
              <a href="#Stitch" @click="switchView('Stitch')">Stitch</a>
            </li>
            <li id="switch-TAS">
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

/* Import Mixins */
import { isOffline } from '../assets/javascript/mixins/isOffline.js';

/* Import Components */
import FileUpload from './BaseComponents/FileUpload/FileUpload.vue';

// Use papa parse to parse csv/tsv files
// Axios to handle HTTP requests
import pp from 'papaparse';
import axios from 'axios';

export default {
  name: 'heading',
  components: {
    'v-file-upload': FileUpload,
  },
  data: function() {
    return {

    }
  },
  mounted() {
    // Event listener for when stitch lines are saved
    eventBus.$on('fetch-files', this.fetchFiles);
    eventBus.$on('upload-files', this.uploadFiles);
  },
  mixins: [
    isOffline
  ],
  methods: {
    fetchFiles() {
      console.log("Fetching data...");

      let vm = this;

      let temp = {
        'SANS1D': [],
        'SANS2D': [],
        'TAS': [],
        'Stitch': []
      }

      // If data is not stored, fetch it, store it, and send data to be plotted
      axios.get('/external/fetch').then(response => {

        let TD = response.data;

        TD.forEach(el => {
          var jobTitle = el.job_title;
          var jobModified = el.date_modified;

          el.results.forEach(r => {
            let key = r.type;
            
            if (key === 'SANS1D-Stitch') {
              
              temp.Stitch.push({
                id: r.id,
                filename: r.filename,
                url: r.url,
                jobTitle: jobTitle,
                dateModified: jobModified
              });

              temp.SANS1D.push({
                id: r.id,
                filename: r.filename,
                url: r.url,
                jobTitle: jobTitle,
                dateModified: jobModified
              });

            } else {
              temp[key].push({
                id: r.id,
                filename: r.filename,
                url: r.url,
                jobTitle: jobTitle,
                dateModified: jobModified
              });
            }
          })

        });

        for (let key in temp) {
          if (temp[key].length > 0) this.$store.commit('addFiles', { loadType: 'fetch', dataType: key, files: temp[key] });
        }
      
      }).catch(function (err) {
          console.log(err.message);
          eventBus.$emit('error-message', err.message, 'danger');
      })

    },
    uploadFiles(files) {

      let temp = {
        'SANS1D': [],
        'SANS2D': [],
        'TAS': [],
        'Stitch': []
      }

      files.forEach( el => {
        let key = el.type;

        if (key === 'SANS1D-Stitch') {
          temp.Stitch.push(el);
          temp.SANS1D.push(el);
        } else {
          temp[key].push(el);
        }

      })

      for (let key in temp) {
        this.$store.commit('addFiles', { loadType: 'upload', dataType: key, files: temp[key] });
      }

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