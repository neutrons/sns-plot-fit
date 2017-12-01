<template>
<div :id='"fit-results-table-" + ID' class='fit-results-table table table-condensed table-responsive' v-show='showTable && !isError'>
  <table class='table table-bordered'>
    <caption>
      <h4>Fit Results:</h4>
    </caption>

    <tbody>
      <tr>
        <td class='fit-file'></td>
        <td class='fit-type'></td>
        <td class='fit-points'></td>
        <td class='fit-range'></td>
        <td class='fit-error'></td>
      </tr>

      <tr>
        <td colspan='2' class='sub-heading'>Fit Configuration:</td>
        <td colspan='2' class='sub-heading'>Coefficients:</td>
        <td colspan='1' class='sub-heading'>Note:</td>
      </tr>
      <tr>
        <td colspan='2' class='fit-configs'>
          <ul>
            <li class='fit-damping'></li>
            <li class='fit-iterations'></li>
            <li class='fit-tolerance'></li>
            <li class='fit-gradient'></li>
          </ul>
        </td>
        <td colspan='2' class='fit-coefficients'>
        </td>
        <td colspan='1' class='fit-note'>
        </td>
      </tr>
    </tbody>
  </table>
</div>
</template>

<script>
import * as d3 from 'd3';

export default {
    name: 'FitResultsTable',
    props: {
        ID: {
            type: String,
            required: true
        },
        isError: {
            type: Boolean,
            default: true
        },
        showTable: {
            type: Boolean,
            default: false
        },
    },
    data() {
        return {

        }
    },
};
</script>

<style lang='less' scoped>
.fit-results-table {
  padding: 0 5px;
  margin: 0 auto;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;

  td {
      padding: 5px;
  }

  .sub-heading {
      text-align: left;
      font-weight: bold;
  }

  ul {
      list-style-type: none;
      padding-left: 10px;
  }
}
</style>