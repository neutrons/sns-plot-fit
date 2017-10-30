import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import * as mutations from './mutations'
import * as d3 from 'd3'

Vue.use(Vuex)


export default new Vuex.Store({
    state: {
      fetched: {
        'SANS1D': [],
        'SANS2D': [],
        'TAS': [],
        'Stitch': []
      },
      uploaded: {
        'SANS1D': [],
        'SANS2D': [],
        'TAS': [],
        'Stitch': []
      },
      colorDomain: {
        'SANS1D': [],
        'TAS': [],
        'Stitch': []
      },
      saved: {
        'SANS1D': [],
        'SANS2D': [],
        'TAS': [],
        'Stitch': []
      },
      xScales: {
        'X': d3.scaleLinear(),
        'X^2': d3.scalePow().exponent(2),
        'Log(X)': d3.scaleLog(),
      },
      yScales: {
        'Y': d3.scaleLinear(),
        'Y^2': d3.scalePow().exponent(2),
        'Log(Y)': d3.scaleLog()
      },
      fitConfigurations: {
        'None': {
          fit: 'None',
          equation: '',
          yTransformation: 'y',
          xTransformation: 'x',
          eTransformation: 'e',
          yLabel: "I",
          xLabel: "Q",
          note: ""
        },
        'Linear': {
          fit: 'Linear',
          equation: 'm*x+b',
          yTransformation: 'y',
          xTransformation: 'x',
          eTransformation: "e",
          yLabel: "I",
          xLabel: "Q",
          note: ""
        },
        'Guinier': {
          fit: 'Guinier',
          equation: "-Rg^2/3*x+I0",
          yTransformation: "log(y)",
          xTransformation: "x^2",
          eTransformation: "((1/y)*e)^2",
          yLabel: "Log(I(q))",
          xLabel: "q^2",
          note: ""
        },
        // 'Low-Q Guinier': {
        //   fit: 'Low-Q Guinier',
        //   equation: "-(L^2/12+Rg^2/2)/3*x+I0",
        //   yTransformation: "log(y)",
        //   xTransformation: "x^2",
        //   eTransformation: "((1/y)*e)^2",
        //   yLabel: "Log(I(q))",
        //   xLabel: "q^2",
        //   note: "Cylinder of length L and Radius R"
        // },
        // 'Intermediate-Q Guinier': {
        //   fit: 'Intermediate-Q Guinier',
        //   equation: "-(Rg^2/2)/3*x+I0/x",
        //   yTransformation: "log(x*y)",
        //   xTransformation: "x^2",
        //   eTransformation: "((1/y)*e)^2",
        //   yLabel: "Log(q*I(q))",
        //   xLabel: "q^2",
        //   note: "Radius R"
        // },
        // 'Flat Object Guinier': {
        //   fit: 'Flat Object Guinier',
        //   equation: "-(T^2/12)/3*x+I0/x^2",
        //   yTransformation: "log(x^2*y)",
        //   xTransformation: "x^2",
        //   eTransformation: "((1/y)*e)^2",
        //   yLabel: "Log(q^2*I(q))",
        //   xLabel: "q^2",
        //   note: "T is the thickness of a flat (lamella) object."
        // },
        'Porod': {
          fit: 'Porod',
          equation: "p0*x^(-p1)",
          yTransformation: "y",
          xTransformation: "x",
          eTransformation: "e",
          yLabel: "I(q)",
          xLabel: "q",
          note: "This is valid for high Q."
        },
        'Zimm': {
          fit: 'Zimm',
          equation: "1/I0+Cl^2/I0*x",
          yTransformation: "1/y",
          xTransformation: "x^2",
          eTransformation: "((-1/y^2)*e)^2",
          yLabel: "1/I(q)",
          xLabel: "q^2",
          note: ""
        },
        'Kratky': {
          fit: 'Kratky',
          equation: "m*x+b",
          yTransformation: "x^2*log(y)",
          xTransformation: "x",
          // because there's no error for X I'm doing e(x) = 0.1
          // e(x) = sqrt(x) is annoying for high x
          eTransformation: "(x^2/y * e)^2 + (2*x*log(y) * 0.1)^2",
          yLabel: "q^2 \times log(I)",
          xLabel: "q",
          note: ""
        },
        'Debye Beuche': {
          fit: 'Debye Beuche',
          equation: "m*x+I0",
          yTransformation: "sqrt(y)",
          xTransformation: "x^2",
          eTransformation: "(1/(2*sqrt(y))*e)^2",
          yLabel: "sqrt(I)",
          xLabel: "Q^2",
          note: ""
        }
      },
        fitSettings: {
          damping: 0.001,
          initialValues: [],
          gradientDifference: 0.1,
          maxIterations: 100,
          errorTolerance: 0.001
      }
    },
    actions,
    getters,
    mutations
})