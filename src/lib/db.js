'use strict'

const debug = require('debug')('db')
const _ = require('lodash')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const { autoIncrement } = require('mongoose-plugin-autoinc')
const { auditLog } = require('mongoose-audit-log').plugin
const config = require('config')

// Object holding all your connection strings
const connections = {}

/**
 * Return a middleware that generates Request ID and
 * sets in a header.
 *
 * @return {function} Express middleware.
 */
module.exports = (opts) => {
  this.opts = _.cloneDeep(opts)
  debug('opts=%O', this.opts)

  const connect = async (dbName) => {
    if (!this.opts) {
      this.opts = config.database
    }
    // If db name is not provided, connect to default db
    dbName = dbName || this.opts.default_db_name
    debug('connect() dbName=%s', dbName)
    if (connections[dbName]) {
      // database connection already exist. Return connection object
      debug('connect() connection exists')
      return connections[dbName]
    }

    // Get new connection
    connections[dbName] = await createNewConnection(this.opts, dbName)

    connections[dbName].once('open', function callback () {
      debug('connect() MongoDB connected successfully')
    })

    return connections[dbName]
  }

  return { connect, autoIncrement, auditLog }
}

async function createNewConnection (opts, dbName) {
  let url = `mongodb://${opts.host}/${dbName}`
  if (opts.replica_set) {
    url = `${url}?replicaSet=${opts.replica_set}`
  }
  debug('connect() url=%s', url)

  // Get mongo options
  const mongoOptions = await getMongoOptions(opts)

  debug('connect() creating a connection to %s', dbName)
  // Create & return new connection
  return mongoose.createConnection(url, mongoOptions)
}

async function getMongoOptions (opts) {
  const mongoOptions = opts.mongo_options
  debug(`${opts.authentication}`)
  if (opts.authentication) {
    let user = opts.user || config.database.user
    let pass = opts.pass || config.database.pass
    if (!user || !pass) {
      throw new Error('DB user or password is missing')
    }
    if (opts.fetch_secrets) {
      // Fetch secrets
      [user, pass] = await Promise.all([
        secretService.getSecretValue(user),
        secretService.getSecretValue(pass)
      ])
    }
    mongoOptions.user = user
    mongoOptions.pass = pass
    mongoOptions.authSource = opts.auth_source
  }

  return mongoOptions
}
