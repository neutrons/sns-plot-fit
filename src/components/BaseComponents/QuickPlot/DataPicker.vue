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