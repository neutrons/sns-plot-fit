<template>
<div class="switch">
    <input type="radio" class="switch-input" id="left" value="left" checked v-model="picked">
    <label for="left" class="switch-label switch-label-off">
      <slot name="left-label">Left</slot>
    </label>

    <input type="radio" class="switch-input" id="right" value="right" v-model="picked">
    <label for="right" class="switch-label switch-label-on">
      <slot name="right-label">Right</slot>
    </label>
    <span class="switch-block"></span>
</div>
</template>

<script>
export default {
    name: 'toggle-switch',
    data() {
    return {
      picked: 'left'
    }
  },
  watch: {
    picked() {
      console.log(this.picked);
    }
  }
}
</script>

<style scoped>
.switch {
  position: relative;
  margin: 20px auto;
  height: 26px;
  width: 120px;
  background: gainsboro;
  border-radius: 0;
}

.switch-label {
  position: relative;
  z-index: 2;
  float: left;
  width: 58px;
  line-height: 26px;
  font-size: 11px;
  color: rgba(0,0,0, 0.5);
  text-align: center;
  cursor: pointer;
}

.switch-input {
  display: none;
}

.switch-input:checked + .switch-label {
  color: white;
  -webkit-transition: 0.15s ease-out;
  -moz-transition: 0.15s ease-out;
  -o-transition: 0.15s ease-out;
  transition: 0.15s ease-out;
}

.switch-input:checked + .switch-label-on ~ .switch-block {
  left: 60px;
}

.switch-block {
  display: block;
  position: absolute;
  z-index: 1;
  top: 2px;
  left: 2px;
  width: 58px;
  height: 22px;
  background: green;
  border-radius: 0;
 
  -webkit-transition: left 0.15s ease-out;
  -moz-transition: left 0.15s ease-out;
  -o-transition: left 0.15s ease-out;
  transition: left 0.15s ease-out;
}
</style>