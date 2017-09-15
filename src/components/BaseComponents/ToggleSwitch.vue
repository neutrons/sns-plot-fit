<template>
<fieldset :disabled="DISABLE" :class="DISABLE ? 'disable' : ''">
<div class="switch">
    <input type="radio" class="switch-input" :id="leftID" :value="leftID" name="edit" :checked="picked" @click="picked = true">
    <label :for="leftID" class="switch-label switch-label-off">
      <slot name="left-label">Left</slot>
    </label>

    <input type="radio" class="switch-input" :id="rightID" name="edit" :value="rightID" :checked="!picked" @click="picked = false">
    <label :for="rightID" class="switch-label switch-label-on">
      <slot name="right-label">Right</slot>
    </label>
    <span class="switch-block"></span>
</div>
</fieldset>
</template>

<script>
export default {
    name: 'toggle-switch',
    props: {
        rightID: {
            type: String,
            default: 'right',
            required: true
        },
        leftID: {
            type: String,
            default: 'left',
            required: true
        },
        DISABLE: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            picked: true
        }
    }
}
</script>

<style scoped>
.disable *{
    opacity: 0.75;
    cursor: not-allowed !important;
}
.switch {
  position: relative;
  margin: 20px auto;
  height: 32px;
  width: 100%;
  background: gainsboro;
  border-radius: 3px;
}

.switch-label {
  position: relative;
  z-index: 2;
  float: left;
  width: 50%;
  line-height: 32px;
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
  left: 50%;
}

.switch-block {
  display: block;
  position: absolute;
  z-index: 1;
  top: 2px;
  left: 2px;
  width: 50%;
  height: 28px;
  background: #449d44;
  border-radius: 3px;
 
  -webkit-transition: left 0.15s ease-out;
  -moz-transition: left 0.15s ease-out;
  -o-transition: left 0.15s ease-out;
  transition: left 0.15s ease-out;
}
</style>