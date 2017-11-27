<template>
  <div class='ORNL404 text-center'>
    <h1>{{msg}}</h1>
    <p>Page doesn't exist</p>
  </div>
</template>

<script>
export default {
  name: 'ORNL404',
  data: function() {
    return {
      msg: '404!',
    }
  },
}
</script>

<style lang='less' scoped>
.ORNL404 {
  position: absolute;
  left: 0;
  right: 0;
  padding: 0px;
}

h1 {
    color: green;
}
</style>