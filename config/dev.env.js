'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

const path = require('path')
const dotenv = require('dotenv').config({path: path.join(process.env.PWD, '.env')})

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  IS_OFFLINE: process.env.IS_OFFLINE,
  FETCH_SANS_URL: process.env.FETCH_SANS_URL,
  FETCH_TAS_URL: process.env.FETCH_TAS_URL,
})
