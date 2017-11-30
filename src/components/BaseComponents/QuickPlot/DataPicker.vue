<template>
<div class='data-picker'>
  <div class="input-group">
    <div class="input-group-btn">
      <button class="btn btn-default" @click='pick("left")'>
            <i class="fa fa-caret-left"></i>
        </button>
    </div>
    <select class='form-control' v-model='picked' @change='emitpick'>
        <option v-for='(item, index) in files' :key='index'>
            {{item}}
        </option>
        </select>
    <div class="input-group-btn">
      <button class="btn btn-default" @click='pick("right")'>
            <i class="fa fa-caret-right"></i>
        </button>
    </div>
  </div>
</div>
</template>

<script>
import axios from 'axios';
import parseData from '../../../assets/javascript/mixins/readFiles/parse/SANS1D.js';

export default {
  name: 'DataPicker',
  props: {
    id: {
        type: String,
    },
    fileList: {
        type: Object,
    },
  },
  data() {
    return {
      picked: '',
    };
  },
  created: function () {
    this.picked = this.files[0];
    this.emitpick();

    window.addEventListener('keyup', this.onKeyUp);
  },
  beforeDestroy: function () {
    window.removeEventListener('keyup', this.onKeyUp);
  },
  computed: {
    files() {
        return Object.keys(this.fileList);
    },
  },
  methods: {
    onKeyUp(event) {

      if (event.key === 'ArrowRight' || event.code === 'ArrowRight') {
        this.pick('right');
      }

      if (event.key === 'ArrowLeft' || event.code === 'ArrowLeft') {
        this.pick('left');
      }
    },
    pick(direction) {
      let pos = this.files.indexOf(this.picked);
      let end = this.files.length - 1;
      let move = direction === 'left' ? pos - 1 : pos + 1;

      if (move < 0) {
        this.picked = this.files[end];
      } else if (move > end) {
        this.picked = this.files[0];
      } else {
        this.picked = this.files[move];
      }

      this.emitpick();
    },
    emitpick() {
        let vm = this;
        // code to read file

        let url = this.fileList[this.picked];

        var temp = this.$store.getters.getSavedFile(this.id, url.filename);
                
        // console.log("Here is the temp:", temp);
        if (temp !== '999') {
            this.$emit('picked', temp.data);
            return;
        }
        
        var promises = [url].map(function(url) {

            if (url.type === 'fetch') {
                return axios.get(url.url).then(function(response) {
                    // console.log("axios response data", response);

                    let data = parseData(response.data, url.filename);
            
                    vm.$store.commit('storeData', { filename: url.filename, data: data, dataType: vm.id});

                    return data;
                });        
            } else if (url.type === 'upload') {

                // Turn file reader into a promise in order to
                // wait on the async reading of files with Promise.all below
                return new Promise((resolve, reject) => {
                    var reader = new FileReader();
                    
                    reader.onload = function (e) {  
                        // Get file content
                        var content = e.target.result;

                        // Code to read Upload 2D file
                        let data = parseData(content, url.filename);

                        vm.$store.commit('storeData', { filename: url.filename, data: data, dataType: vm.id});
                        
                        resolve(data);    
                    }
                    
                    reader.readAsText(url.url, "UTF-8");
                });
            } else {
                console.log("Sorry, uknown type.");
            }
        });

        if (promises.length > 0) {

            Promise.all(promises).then(results => {
                
                vm.$emit('picked', results[0].data);

            }).catch(reason => { console.log(reason) });
        }
    },
  },
};
</script>

<style lang='less' scoped>
select {
  text-align-last: center;
}

.input-group {
  width: 95%;
  margin: 0 auto;
}
</style>