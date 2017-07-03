<template>
  <div class="row footer">
    <div class="col-sm-12">
      <footer>ORNL &copy; {{today.getFullYear()}}</footer>
   </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      today: new Date()
    }
  }
}

</script>

<style scoped>
footer {
    text-align: right;
    color: white;
    padding: 0px;
}

div.footer {
  background: #008556;
  position:absolute;
  bottom:0;
  width:100%;
  padding: 5px;
  height: 35px;
}
</style>
