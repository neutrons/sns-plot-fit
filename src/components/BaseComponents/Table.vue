<template>
<div class="table-container">
  <table class="table table-hover table-bordered table-condensed">
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
        default() {
            return ['Field 1', 'Field 2', 'Field 3']
        }
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

<style scoped>
.table-container {
  height: auto;
  max-height: 225px;
  overflow: auto;
  background-color: white;
}

th {
    text-align: center;
}

td
{
    text-align: center;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

td:hover
{
    overflow: visible; 
    white-space: normal;
    text-overflow: wrap;
    word-wrap: break-word;
    height:auto;
}
</style>
