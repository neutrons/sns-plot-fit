import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import * as d3 from 'd3';

const store = new Vuex.Store({
  state: {
    fetched1DFiles: [],
    fetched2DFiles: [],
    uploaded1DFiles: [],
    uploaded2DFiles: [],
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
    }
  },
  getters: {
    get1DFiles: state => {

    },
    get2DFiles: state => {

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

    },
    getUploaded1D: state => {

    },
    getUploaded2D: state => {

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
      state.uploaded1DFiles = files
    },
    addUploaded2DFiles(state, files) {
      state.uploaded2DFiles = files
    }
  },
  actions: {
  }
})

export default store;