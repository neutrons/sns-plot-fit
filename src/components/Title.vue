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
          <img src="../assets/images/ornl_logo.png" class="navbar-brand">
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

          <ul id="route-list" class="nav navbar-nav navbar-right">
            <router-link v-for='(route, index) in routes' :key='index'
              :to='route.path' tag='li'
            >
              <a>{{route.name}}</a>
            </router-link>
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
      routes: [],
    }
  },
  mounted() {
    // Event listener for when stitch lines are saved
    eventBus.$on('fetch-files', this.fetchFiles);
    eventBus.$on('upload-files', this.uploadFiles);

    // Add a list of links excluding the redirect path
    this.routes = this.$router.options.routes.slice(3, this.$router.options.routes.length);
    this.setDocTitle();
  },
  mixins: [
    isOffline
  ],
  methods: {
    setDocTitle() {
      // Set the document title to current route path
      document.title = 'ORNL - ' + this.$route.meta.title;
    },
    fetchFiles() {
      console.log("Fetching data...");

      let vm = this;

      let temp = {
        'SANS1D': {},
        'SANS2D': {},
        'TAS': {},
        'Stitch': {},
      };

      // If data is not stored, fetch it, store it, and send data to be plotted
      axios.get('/external/fetch').then(response => {

        let data = response.data;

        data.forEach(el => {
          var jobTitle = el.job_title;
          var jobModified = el.date_modified;

          el.results.forEach(r => {
            let key = r.type;
            
            if (key === 'SANS1D-Stitch') {

              temp.Stitch[r.filename] = {
                id: r.id,
                filename: r.filename,
                url: r.url,
                jobTitle: jobTitle,
                dateModified: jobModified,
                tags: [],
                loadType: 'fetched',
              };

              temp.SANS1D[r.filename] = {
                id: r.id,
                filename: r.filename,
                url: r.url,
                jobTitle: jobTitle,
                dateModified: jobModified,
                tags: [],
                loadType: 'fetched',
              };
            } else {
              temp[key][r.filename] = {
                id: r.id,
                filename: r.filename,
                url: r.url,
                jobTitle: jobTitle,
                dateModified: jobModified,
                tags: [],
                loadType: 'fetched',
              };
            }
          })

        });

        for (let key in temp) {

          if (Object.keys(temp[key]).length > 0) {

            this.$store.commit('addFiles', 
              {
                loadType: 'fetched',
                dataType: key, 
                files: temp[key] 
              });
          }
        }
      
      }).catch(function (err) {
          console.log(err.message);
          eventBus.$emit('error-message', err.message, 'danger');
      })

    },
    uploadFiles(files) {

      let temp = {
        'SANS1D': {},
        'SANS2D': {},
        'TAS': {},
        'Stitch': {}
      }

      files.forEach( el => {
        let key = el.type;
        let fname = el.filename;

        el.tags = [];
        el.loadType = 'uploaded';

        if (key === 'SANS1D-Stitch') {
          temp.Stitch[fname] = el;
          temp.SANS1D[fname] = el;
        } else {
          temp[key][fname] = el;
        }

      })

      for (let key in temp) {
        if (Object.keys(temp[key]).length > 0) {

            this.$store.commit('addFiles', 
              {
                loadType: 'uploaded',
                dataType: key, 
                files: temp[key] 
              });
          }
      }

    },
  },
  watch: {
    $route() {
      // Anytime page changes update doc title
      this.setDocTitle();
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
#route-list li {
  margin: 0px;
  text-align: center;
}

#route-list a {
  transition: all 0.5s ease;
  color: #00672c;
}

#route-list a:hover {
  background: #00672c;
  color: white;
}

#route-list li.active a {
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