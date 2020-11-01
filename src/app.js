'use strict'

const express = require('express')
const config = require('config')
const app = express()

// Initialize database connection
const dbUtil = require('./lib/db')(config.database)
dbUtil.connect()
// Make db utils globally available
global.db = dbUtil

// Set up middlewares
require('./middlewares')(app)

// Load routes
require('./routes')(app)

module.exports = app
