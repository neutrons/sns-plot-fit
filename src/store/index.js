import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import * as d3 from 'd3';

/* Import Fit Settings */
import SANS1Dconfig from './fits/SANS1D.js';
import TASconfig from './fits/TAS.js';
import fitSettings from './fits/settings.js';

Vue.use(Vuex);

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
      fit: {
        SANS1D: SANS1Dconfig,
        TAS: TASconfig,
        settings: fitSettings,
      },
    },
    actions,
    getters,
    mutations,
});