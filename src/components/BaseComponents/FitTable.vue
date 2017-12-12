<template>
<div :id='"fit-results-table-" + ID' class='fit-results-table table table-condensed table-responsive'>
  <table class='table table-bordered'>
    <caption>
      <h4>Fit Results:</h4>
    </caption>

    <tbody>
      <tr>
        <td class='fit-file'><b>Fit File:</b> {{plotParameters.fileToFit}}</td>
        <td class='fit-type'><b>Fit Type:</b> {{plotParameters.fitConfiguration.fit}}</td>
        <td class='fit-points'><b>No. Points:</b> {{fitCount}}</td>
        <td class='fit-range'><b>Fit Range:</b> [{{fitRange[0].toExponential(2)}}, {{fitRange[1].toExponential(2)}}]</td>
        <td class='fit-error'><b>Fit Error:</b> {{fitError === null || fitError === undefined ? 'Not Available' : fitError.toExponential(2)}}</td>
      </tr>

      <tr>
        <td colspan='2' class='sub-heading'>Fit Configuration:</td>
        <td colspan='2' class='sub-heading'>Coefficients:</td>
        <td colspan='1' class='sub-heading'>Note:</td>
      </tr>
      <tr>
        <td colspan='2' class='fit-configs'>
          <ul>
            <li class='fit-damping'><b>Damping:</b> {{plotParameters.fitConfiguration.settings.parameters.damping.value}}</li>
            <li class='fit-iterations'><b>No. Iterations:</b> {{plotParameters.fitConfiguration.settings.parameters.maxIterations.value}}</li>
            <li class='fit-tolerance'><b>Error Tolerance:</b> {{plotParameters.fitConfiguration.settings.parameters.errorTolerance.value}}</li>
            <li class='fit-gradient'><b>Gradient Difference:</b> {{plotParameters.fitConfiguration.settings.parameters.gradientDifference.value}}</li>
          </ul>
        </td>
        <td colspan='2' class='fit-coefficients'>
          <ul>
            <li v-for='(item, index) in plotParameters.fitConfiguration.settings.initialValues' :key='index'>
              {{formatInitialValues(item)}}
            </li>
          </ul>
        </td>
        <td colspan='1' class='fit-note'>
          {{plotParameters.fitConfiguration.note}}
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
        fitRange: {
          type: Array,
        },
        fitCount: {
          type: Number,
        },
        fitError: {
          type: Number,
        },
        plotParameters: {
          type: Object,
        },
        xScale: {
          type: Function,
        },
        xBrushSelection: {
          type: Number,
        }
    },
    methods: {
      formatInitialValues(item) {
        if (this.plotParameters.fitConfiguration.fit === "Guinier" && item[0] === 'Rg') {
          let RgX = item[1] * Math.sqrt(this.xScale.invert(this.xBrushSelection));

          return `${item[0]}: ${item[1]} | Rg * x_max = ${RgX}`;
        }

        return `${item[0]}: ${item[1]}`;
      },
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