<template>
<div :class='{disable}'>
  <label>{{name}}: {{sliderValue}}</label>

  <input type='range' 
    :disabled='disable'
    :min='min' :max='max'
    :step='step'
    v-model='sliderValue'
    @mouseup='update'
    @touchend='update'
    @keyup='update'/>
</div>
</template>

<script>
export default {
    name: 'RangeSlider',
    props: {
        name: {
            type: String,
        },
        disable: {
            type: Boolean,
            default: false,
        },
        min: {
            type: Number,
            default: 0,
        },
        max: {
            type: Number,
            default: 10,
        },
        step: {
            type: Number,
            default: 1,
        },
        value: {
            type: [Number, String],
            default: 1,
        },
  },
  data() {
    return {
      sliderValue: this.value,
    };
  },
  methods: {
      update(e) {
          if (this.value !== +e.target.value) {
            this.$emit("update:value", +e.target.value);
            this.$emit('input');
          }
      }
  },
  watch: {
      value() {
          this.sliderValue = this.value;
      }
  }
};
</script>

<style lang='less' scoped>
.disable {
  opacity: 0.5;
}
</style>