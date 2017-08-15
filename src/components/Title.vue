<template>
  <div id="heading" class="container-fluid">

    <nav id="title" class="navbar navbar-default">
      <div id="menu" class="container-fluid">
        <div class="navbar-header">
          <img src="../assets/ornl_logo.png">
        </div>


        <ul class="nav navbar-nav navbar-right">
          <li><button class="btn btn-default btn-fetch" @click="fetchData">Fetch Data <span class="glyphicon glyphicon-download"></span></button></li>
          <li><label class="btn btn-default btn-upload">Load Files <span class="glyphicon glyphicon-file"></span> <input id="file-upload" type="file" style="display: none;" @change="uploadFile($event.target.files)" multiple></label></li>
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

// Use papa parse to parse csv/tsv files
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
    // Listen for drag and drop files
    eventBus.$on('upload-files', this.uploadFile);
  },
  methods: {
    fetchData: function() {
      //eventBus.$emit('fetch-data');

      // CODE TO GET DATA WITH API REQUEST //
        var url = document.getElementById("urlid").getAttribute("data-urlid");
        var files = JSON.parse(url);

        // Set a variable to 'this' to be able to reference the getFiles variable in the scope of the 'getFiles' function
        var self = this;

        // For loop to GET multiple files and push them to an array
        for (var i = 0; i < files.length; i++) {

          function getFiles(i) {
            
            var fileName= files[i].name;
            var fileURL = files[i].url;

            if( self.dataType(fileURL) === '1D') {
              //Make a GET request to data file
              axios.get(fileURL).then(response => {
                let results = self.read1D(response.data);

                // Filter out negative values for x and y
                results.data.filter(el => el.y > 0 && el.x > 0);

                // Add file name to data objects
                results.data.forEach(el => el.name = files[i].name);
                //console.log("results data:", results.data);

                // Push to 1D Get Files list
                eventBus.$emit('add-get-1D', {data: results.data,
                                              fileName: fileName });
              });

            } else if ( self.dataType(fileURL) === '2D') {
              //Make a GET request to data file
              axios.get(fileURL).then(response => {
                let results = self.read2D(response.data);

              // Add file name to data objects
              results.data.forEach(el => el.name = fileName);

              // Push to 2D Get Files list
              eventBus.$emit('add-get-2D', {data: results.data, fileName: fileName});
              });
            } else {
              // error, don't read for now
              let errorMsg = "<strong>Error! </strong>" + fileURL + " is not a supported type.<br/>Make sure the file ends in <em>'Iq.txt'</em> or <em>'Iqxy.dat'</em>";
              eventBus.$emit('error-message', errorMsg);
            }
          }

          // Call 'getFiles' passing in i each time to access appropriate elements in files array
          getFiles(i);
        }
      // END API REQUEST FOR DATA //
    },
    uploadFile: function(files) {
      //let files = document.getElementById("file-upload").files;
      //console.log("Files:", files[0]);
      //eventBus.$emit('upload-file', files);


      // CODE TO UPLOAD DATA FILES //
        var self = this;

        function loadFiles(file) {

          // Pull the file name and remove the ".txt" extension
          var fileURL = file.name;
          var reader = new FileReader();

          reader.onload = function (e) {
            
          // Get file content
          var content = e.target.result;

          if(self.dataType(fileURL) === '1D') {
            // Code to read Upload 1D file
            let results = self.read1D(content);

            // Filter out negative values for x and y
            results.data.filter(el => el.y > 0 && el.x > 0);

            // Add file name to data objects
            var fileName = file.name.substr(0, file.name.lastIndexOf('.txt')) || file.name;
            results.data.forEach(el => el.name = fileName);
            //console.log("results data:", results.data);

            // Push to 1D Get Files list
            eventBus.$emit('add-uploaded-1D', {data: results.data, fileName: fileName });

          } else if (self.dataType(fileURL) === '2D') {
            // Code to read Upload 2D file
            let results = self.read2D(content);
            // console.log("results", results);

            // Add file name to data objects
            var fileName = file.name.substr(0, file.name.lastIndexOf('.dat')) || file.name;
            results.data.forEach(el => el.name = fileName);

            // Push to 2D Get Files list
            eventBus.$emit('add-uploaded-2D', {data: results.data, fileName: fileName });

          } else {
            let errorMsg = "<strong>Error! </strong>" + fileURL + " is not a supported type.<br/>Make sure the file ends in <em>'Iq.txt'</em> or <em>'Iqxy.dat'</em>";
            eventBus.$emit("error-message", errorMsg);
          }

          //console.log("results data:", results.data);
          
          }
          reader.readAsText(file, "UTF-8");
        }

        for (var i = 0; i < files.length; i++) {
          // console.log("File["+i+"]", files[i]);
          // let fileName = files[i].name.substr(0, files[i].name.lastIndexOf('.txt')) || files[i].name;
          // console.log("Filename:", fileName);
          
          loadFiles(files[i]);
          // if (files[i].type !== "text/plain") {
          //   //if text file is not submitted alert and skip over it
          //   alert("Sorry, " + files[i].type + " is not an accepted file type.")
          //   continue;
          // } else {
          //   if (this.uploadedFiles.length > 0) {
          //     if (!this.checkDuplicateFile(files[i].name.substr(0, files[i].name.lastIndexOf('.txt')))) {
          //       loadFiles(files[i]);
          //     }
          //   } else {
          //     loadFiles(files[i]);
          //   }
          // };
        }

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
    read1D: function(data) {
       function beforeFirstChunk1D(chunk) {
        // Split the text into rows
        var rows = chunk.split(/\r\n|\r|\n/);

        var delimiterRegex = /([\s,]+)/g;
        // Find the delimiter on 3rd row
        var match = delimiterRegex.exec(rows[2]);
        var delimiter = match[1];
        var header = rows[0];

        if (header.startsWith("#")) {
          header = header.replace(/#\s*/, '');
          header = header.split(/[\s,]+/).join(delimiter);
        }

        rows[0] = header.toLowerCase();
        // Remove the 2nd row if it's not data
        if (rows[1].length <= 2) {
          rows.splice(1, 1);
        }
        return rows.join("\r\n");
      }

      // files ending in Iq.txt
      var config1D =
          {
            header : true,
            dynamicTyping : true, // parse string to int
            delimiter : "",       // auto-detect
            newline : "",         // auto-detect
            quoteChar : '"',
            skipEmptyLines : true,
            beforeFirstChunk : beforeFirstChunk1D
          }

      var results1D = pp.parse(data, config1D );
      
      return results1D;
    },
    read2D: function(data) {
      function beforeFirstChunk2D(chunk) {
        // Split the text into rows
        var rows = chunk.split(/\r\n|\r|\n/);
        var header = rows[0];
        header = header.replace(/,/, '');
        if (header.startsWith("Data columns")) {
          header = header.replace(/Data columns\s*/, '');
          header = header.split(/[\s,-]+/).join("  ");
        }

        // Rename headings for readability
        header = header.replace(/I\(QxQy\)/, 'intensity');
        header = header.replace(/err\(I\)/, 'error');

        rows[0] = header.toLowerCase();
        // Remove the 2nd row if it's not data
        if (rows[1].split(/[\s,-]+/).length <= 2) {
          rows.splice(1, 1);
        }
        return rows.join("\r\n");
      }

      // files endind in Iqxy.dat
      var config2D = {
        header : true,
        dynamicTyping : true, // parse string to int
        delimiter : "  ",
        newline : "", // auto-detect
        quoteChar : '"',
        skipEmptyLines : true,
        beforeFirstChunk : beforeFirstChunk2D
      }

      var results2D = pp.parse(data, config2D );

      return results2D;
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