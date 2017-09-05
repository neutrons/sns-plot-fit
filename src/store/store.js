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