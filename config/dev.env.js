'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

require('dotenv').load();

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  IS_OFFLINE: process.env.IS_OFFLINE
})
