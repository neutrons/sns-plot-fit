import Vue from 'vue';
import Vuex from 'vuex';

import pp from 'papaparse';
import axios from 'axios';
import * as _ from 'lodash';

Vue.use(Vuex);

import * as d3 from 'd3';

const store = new Vuex.Store({
  state: {
    fetched1DFiles: [],
    fetched2DFiles: [],
    uploaded1DFiles: [],
    uploaded2DFiles: [],
    saved1DData: {},
    saved2DData: {},
    colorDomain: [],
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
            equation: null,
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
            eTransformation: "((1/x)*e)^2",
            yLabel: "Log(I(q))",
            xLabel: "q^2",
            note: ""
          },
          'Low-Q Guinier': {
            fit: 'Low-Q Guinier',
            equation: "-(L^2/12+R^2/2)/3*x+I0",
            yTransformation: "log(y)",
            xTransformation: "x^2",
            eTransformation: "((1/x)*e)^2",
            yLabel: "Log(I(q))",
            xLabel: "q^2",
            note: "Cylinder of length L and Radius R"
          },
          'Intermediate-Q Guinier': {
            fit: 'Intermediate-Q Guinier',
            equation: "-(R^2/2)/3*x+I0/x",
            yTransformation: "log(x*y)",
            xTransformation: "x^2",
            eTransformation: "((1/x)*e)^2",
            yLabel: "Log(q*I(q))",
            xLabel: "q^2",
            note: "Radius R"
          },
          'Flat Object Guinier': {
            fit: 'Flat Object Guinier',
            equation: "-(T^2/12)/3*x+I0/x^2",
            yTransformation: "log(x^2*y)",
            xTransformation: "x^2",
            eTransformation: "((1/x)*e)^2",
            yLabel: "Log(q^2*I(q))",
            xLabel: "q^2",
            note: "T is the thickness of a flat (lamella) object."
          },
          'Porod': {
            fit: 'Porod',
            equation: "log10(A)-n*log10(x)",
            yTransformation: "log10(y)",
            xTransformation: "log10(x)",
            eTransformation: "(1/y * e)^2",
            yLabel: "Log10(I(q))",
            xLabel: "Log10(q)",
            note: "This is valid for high Q."
          },
          'Zimm': {
            fit: 'Zimm',
            equation: "1/I0+Cl^2/I0*x",
            yTransformation: "1/y",
            xTransformation: "x^2",
            eTransformation: "((-1/x^2)*e)^2",
            yLabel: "1/I(q)",
            xLabel: "q^2",
            note: ""
          },
          'Kratky': {
            fit: 'Kratky',
            equation: "m*x+b",
            yTransformation: "x^2*log(y)",
            xTransformation: "x",
            eTransformation: "(2*x*log(y))^2 + (x^2/y * e)^2",
            yLabel: "q^2 \times log(I)",
            xLabel: "q",
            note: ""
          },
          'Debye Beuche': {
            fit: 'Debye Beuche',
            equation: "m*x+I0",
            yTransformation: "sqrt(y)",
            xTransformation: "x^2",
            eTransformation: "(1/(2*sqrt(x))*e)^2",
            yLabel: "sqrt(I)",
            xLabel: "Q^2",
            note: ""
          }
        }
  },
  getters: {
    get1DFiles: state => {

    },
    get2DFile: state => (id) => {
      var temp = null;

      for(let i = 0, len = state.fetched2DFiles.length; i < len; i++) {
        let tempFile = state.fetched2DFiles[i];
        if(id === tempFile.filename) {
          temp = tempFile;
          break;
        }
      }

      return temp;
    },
    getColorDomain: state => {
      return state.colorDomain
    },
    getDataType: state => {
      
    },
    getXScales: state => {
      return state.xScales
    },
    getYScales: state => {
      return state.yScales
    },
    getXScaleByID: state => (id) => {
      return state.xScales[id]
    },
    getYScaleByID: state => (id) => {
      return state.yScales[id]
    },
    getFetched1D: state => {
      return state.fetched1DFiles
    },
    getFetched2D: state => {
      return state.fetched2DFiles
    },
    getUploaded1D: state => {
      return state.uploaded1DFiles
    },
    getUploaded2D: state => {
      return state.uploaded2DFiles
    },
    getGroups: state => (type) => {
      
      if(type === '1D') {
        return state.fetched1DFiles.map(el => el.jobTitle)
      } else {
        return state.fetched2DFiles.map(el => el.jobTitle)
      }

    },
    getSaved1D: state => (file) => {
      let temp = state.saved1DData[file];
      
      if(temp === undefined) {
        return '999'
      } else {
        return temp;
      }
    },
    getSaved2D: state => (file) => {
      let temp = state.saved2DData[file];
      
      if(temp === undefined) {
        return '999'
      } else {
        return temp;
      }
    },
    inUploaded1D: state => (fname) => {
      var match = false
      
      for(let i = 0, len = state.uploaded1DFiles.length; i < len; i++) {
        var temp = state.uploaded1[i]
        if(fname === temp.filename) {
          match = true
          break
        }
      }

      return match;
    },
    inUploaded2D: state => (fname) => {
      var match = null
      
      for(let i = 0, len = state.uploaded2DFiles.length; i < len; i++) {
        var temp = state.uploaded2DFiles[i]
        if(fname === temp.filename) {
          match = temp;
          break;
        }
      }

      return match;
    },
    getFitConfigs: state => {
      return state.fitConfigurations;
    }
  },
  mutations: {
    addFetched1DFiles(state, files) {
      state.fetched1DFiles = files
    },
    addFetched2DFiles(state, files) {
      state.fetched2DFiles = files
    },
    addUploaded1DFiles(state, files) {
      // console.log("Add 1D files...", files);
      state.uploaded1DFiles = state.uploaded1DFiles.concat(files)
    },
    addUploaded2DFiles(state, files) {
      // console.log("Add 2D files...", files);
      state.uploaded2DFiles = state.uploaded2DFiles.concat(files)
    },
    store1DData(state, data) {
      let tempName = data.filename
      let tempData = data.data
      state.saved1DData[tempName] = tempData
    },
    store2DData(state, data) {
      let tempName = data.filename
      let tempData = data.data
      state.saved2DData[tempName] = tempData
    },
    remove1DFile(state, filename) {

    },
    remove2DFile(state, filename) {
      let index = null;
      
      for(let i = 0, len = state.uploaded2DFiles.length; i < len; i++) {

        let temp = state.uploaded2DFiles[i];
        if(filename === temp.filename) {
          index = i
          
          break
        }
      }

      // Remove from 2D Uploads list
      state.uploaded2DFiles.splice(index, 1);

      // Delete from stored list if present
      delete state.saved2DData[filename];
    }
  },
  actions: {
    read1DData() {

    },
    read2DData() {

    }

  }
})

export default store;