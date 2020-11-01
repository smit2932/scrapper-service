'use strict'

const debug = require('debug')('logger')
const config = require('config')
const path = require('path')
const bunyan = require('bunyan')

const appConfig = config.get('app')
const logsConfig = config.get('logs')
debug('logsConfig=%s', JSON.stringify(logsConfig))

const name = appConfig.name
debug('name=%s', name)
const configs = {
  name,
  streams: []
}

const logLevel = logsConfig.level

if (logLevel !== 'off') {
  switch (logsConfig.stream) {
    case 'gelf':
      const stream = require('gelf-stream').forBunyan(
        logsConfig.gelf_hostname,
        logsConfig.gelf_port
      )
      configs.streams.push({
        type: 'raw',
        stream: stream,
        level: logLevel
      })
      configs.streams.push({
        type: 'stream',
        stream: process.stderr,
        level: 'error'
      })
      break
    case 'rotating-file':
      const logsDirectory = logsConfig.logs_directory || path.join(__dirname, '../../logs')
      const logFilename = path.join(`${name}`, `${name}.json.log`)

      configs.streams.push({
        type: 'rotating-file',
        path: path.join(logsDirectory, logFilename),
        level: logLevel,
        period: logsConfig.rotation_period,
        count: logsConfig.max_rotated_files
      })
      break
    case 'console':
    default:
      configs.streams.push({
        type: 'stream',
        stream: process.stdout,
        level: logLevel
      })
  }
}

debug('Creating logger instance')
const logger = bunyan.createLogger(configs)

module.exports = logger
