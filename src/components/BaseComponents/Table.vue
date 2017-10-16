<template>
<div class="table-container">
  <table class="table table-hover table-bordered">
      <thead>
        <tr>
          <th v-for="field in fieldNames">{{field}}</th>
        </tr>
      </thead>
      <tbody>
          <slot></slot>
      </tbody>
  </table>
</div>
</template>

<script>
export default {
    props: {
        fieldNames: {
            type: Array,
            default: ['Field 1', 'Field 2', 'Field 3']
        }
    },
    data: function () {
      return {
          
      }
    },
    computed: {

    },
    methods: {

    }
  }
</script>

<style lang="less" scoped>
@import url('../../assets/styles/less/responsiveText.less');

.table-container {
  height: auto;
  max-height: 225px;
  overflow: auto;
  background-color: white;
}

table {
    .fluid-type(font-size, 300px, 2000px, 8px, 14px);
    margin-bottom: 0px;
    
    th, td { 
        text-align: center;
        padding: 0px !important; 
        margin: 0px !important; 
    }

    .td-check {
        width: 30px;
    }
    
    .td-name {
        max-width: 50px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        
        &:hover {
            overflow: visible; 
            white-space: normal;
            text-overflow: wrap;
            word-wrap: break-word;
            height: auto;
        }
    }
}
</style>
