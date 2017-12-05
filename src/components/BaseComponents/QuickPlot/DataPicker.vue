<template>
<div class='data-picker'>
  <hr>
  <div class='col-sm-6'>
    <div class="input-group">
      <div class="input-group-btn">
        <button class="btn btn-default" @click='pick("left")'>
              <i class="fa fa-caret-left"></i>
        </button>
      </div>
      <select class='form-control' v-model='picked' @change='emitpick'>
          <option v-for='(file, index) in filenames' :key='index'>
              {{file}}
          </option>
          </select>
      <div class="input-group-btn">
        <button class="btn btn-default" @click='pick("right")'>
              <i class="fa fa-caret-right"></i>
          </button>
      </div>
    </div>
  </div>
  <div class='col-sm-6'>
    <div class='input-group'>
      <span class='input-group-addon'>Tags</span>
      <multiselect
        :limit='1'
        :limitText='count => { return "+" + count + " more"; }'
        :value='tags'
        :options='allTags'
        placeholder="Search or add a tag"
        :multiple='true'
        :taggable='true'
        :close-on-select='false'
        @tag='enterTag'
        @select='selectTag'
        @remove='removeTag'
      ></multiselect>
    </div>
  </div>
</div>
</template>

<script>
import Multiselect from 'vue-multiselect';
import _ from 'lodash';

export default {
  name: 'DataPicker',
  components: {
    Multiselect,
  },
  data() {
    return {
      picked: '',
    };
  },
  created: function () {
    this.picked = this.filenames[0]
    this.emitpick();

    window.addEventListener('keyup', this.onKeyUp);
  },
  beforeDestroy: function () {
    window.removeEventListener('keyup', this.onKeyUp);
  },
  computed: {
    id() {
      return this.$route.name;
    },
    getUploaded() {
      return this.$store.getters.getUploaded(this.$route.name);
    },
    getFetched() {
      return this.$store.getters.getFetched(this.$route.name);
    },
    mergedList() {
      return Object.assign({}, this.getUploaded, this.getFetched);
    },
    filenames() {
      return Object.keys(this.mergedList);
    },
    tags() {
      return this.mergedList[this.picked].tags;
    },
    allTags() {
      let temp = [];

      this.filenames.forEach(name => {
        this.mergedList[name].tags.forEach(tag => {
          if (temp.indexOf(tag) === -1) {
            temp.push(tag);
          }
        })
      });

      return temp;
    },
    loadType() {
      return this.mergedList[this.picked].loadType;
    }
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
      let pos = this.filenames.indexOf(this.picked);
      let end = this.filenames.length - 1;
      let move = direction === 'left' ? pos - 1 : pos + 1;

      if (move < 0) {
        this.picked = this.filenames[end];
      } else if (move > end) {
        this.picked = this.filenames[0];
      } else {
        this.picked = this.filenames[move];
      }

      this.emitpick();
    },
    removeTag(tag) {
      this.$store.commit('removeTag', {id: this.id, loadType: this.loadType, file: this.picked, tag: tag});
    },
    selectTag(tag) {
      this.$store.commit('addTag', {id: this.id, loadType: this.loadType, file: this.picked, tag: tag});
    },
    enterTag(tag) {
      this.$store.commit('addTag', {id: this.id, loadType: this.loadType, file: this.picked, tag: tag});
    },
  },
};
</script>

<style lang='less' scoped>
@import '../../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css';

.multiselect, .multiselect__tags {
  padding-left: 0px;
}

select {
  text-align-last: center;
}

.input-group-btn {
  padding: 0px;
}
</style>