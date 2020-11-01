'use strict'

const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const httpContext = require('express-http-context')
const requestId = require('./requestId')
const log = require('./log')
const httpContextMiddleware = require('./httpContext')
const config = require('config')
const logger = require('../lib/logger')

module.exports = function (app) {
  app.options('*', cors(config.cors))
  app.use(express.json())
  app.use(express.urlencoded({
    extended: false
  }))
  app.use(cookieParser())
  app.use(httpContext.middleware)
  app.use(requestId())
  app.use(log(logger, config.logs))
  app.use(httpContextMiddleware())
  logger.debug('Configuration-mgmt-Service is running on port 8082')
}
