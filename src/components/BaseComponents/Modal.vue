<template>
<transition name='modal'>
  <div class='modal-mask'>
    <div class='modal-wrapper'>
      <div class='modal-container'>
        <button class='pull-right btn btn-danger btn-sm btn-circle' @click='$emit("close")'>
            <i class='fa fa-close'></i>
        </button>

        <div class='modal-header'>
          <h3>{{header}}</h3>
        </div>

        <div class='modal-body'>
          <slot name='body'>
            Default Body
          </slot>
        </div>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    header: {
      type: String,
      default: 'Modal Header',
    },
  },
};
</script>

<style lang='less' scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 75vw;
  margin: 0px auto;
  padding: 20px 5px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  font-family: Helvetica, Arial, sans-serif;
  transition: all 0.3s ease;
  overflow-y: visible;
}

.modal-header h3 {
  margin-top: 0;
  color: green;
  text-align: center;
}

.modal-body {
  margin: 20px 0;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.btn-circle {
  position: relative;
  top: -20px;
  right: -5px;
  border-radius: 0px;
}
</style>