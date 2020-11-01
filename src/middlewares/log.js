'use strict'

const debug = require('debug')('log')
const bunyan = require('bunyan')
const onHeaders = require('on-headers')
const onFinished = require('on-finished')
const _ = require('lodash')
const pathToRegexp = require('path-to-regexp')
const responseHeader = 'X-Response-Time'

/**
 * Return a middleware function that logs the request and response obejcts.
 *
 * A pre-initiated logger instance is required when using this middleware.
 * This middleware logs request object when this middleware function executes.
 * Response object is logged when 'headers' event is triggered on response object.
 *
 * @author Bipin Thite
 * @version 1.0
 * @borrows https://github.com/posquit0/koa-rest-api-boilerplate/blob/master/app/middlewares/log.js
 * @borrows https://github.com/richardschneider/express-mung/blob/master/index.js
 * @param {object} opts Options
 * @returns An express middleware function
 */
module.exports = function (logger = null, opts = {}) {
  debug('opts=%O', opts)
  const logRequests = opts.middleware.logRequests || true
  const logResponses = opts.middleware.logResponses || true
  const exclusionList = opts.middleware.exclusionList || []

  if (typeof logger !== 'object' || logger === null) {
    throw new TypeError('Logger required')
  }
  debug('logger=', logger)

  return function (req, res, next) {
    // Record start time
    const startTime = process.hrtime()

    const skipThisRequest = doExclude(req.path, exclusionList)

    // Configure logger
    req.log = logger.child({ reqId: req.id })
    req.log.addSerializers({
      req: reqSerializer,
      res: resSerializer,
      err: bunyan.stdSerializers.err
    })

    // Log the request object
    if (logRequests && !skipThisRequest) {
      req.log.info(
        { req: req, event: 'request' },
        `Request start for id: ${req.id}`
      )
    }

    // There is no direct access to body of response object
    // So, we need to hack in to json() function
    let original = res.json
    function jsonHook (json) {
      let originalJson = json
      res.json = original
      if (res.headersSent) { return res }
      const body = {
        status_code: json['status_code'],
        status_message: json['status_message'],
        errors: json['errors'],
        error_code: json['error_code'],
        error_msg: json['error_message'],
        error_description: json['error_description']
      }
      res.body = body

      if (res.headersSent) { return res }

      if (json === undefined) { json = originalJson }

      return original.call(this, json)
    }
    // Override default json() function with ours
    res.json = jsonHook

    onHeaders(res, function onHeaders () {
      // Record finish time
      const hrtime = process.hrtime(startTime)
      const responseTime = hrtime[0] * 1e3 + hrtime[1] / 1e6
      res.responseTime = responseTime

      // Set response time header
      res.set(responseHeader, `${responseTime} ms`)
    })

    if (logResponses && !skipThisRequest) {
      onFinished(res, function onFinished () {
        // Log the response object
        req.log.info(
          { req: req, res: res, event: 'response' },
          `Request successfully completed for id: ${req.id}`)
      })
    }

    // Call next middleware in the chain
    next()
  }
}

/**
 * Request serializer
 *
 * @param {object} req Request object
 */
function reqSerializer (req = {}) {
  let body
  if (req.body) {
    body = _.cloneDeep(req.body)
    // Do not log the passwords
    body.password = undefined
    body.userPassword = undefined
  }

  return {
    method: req.method,
    path: req.path,
    url: (req.baseUrl || '') + (req.url || '-'),
    body: body,
    headers: req.headers,
    protocol: req.protocol,
    remoteAddress: getIP(req),
    query: req.query,
    userAgent: req.header('user-agent'),
    referer: req.header('referer') || req.header('referrer') || '-',
    httpVersion: req.httpVersionMajor + '.' + req.httpVersionMinor
  }
}

/**
 * Response serializer
 *
 * @param {object} req Response object
 */
function resSerializer (res = {}) {
  return {
    statusCode: res.statusCode,
    responseTime: res.responseTime,
    type: res.get('Content-Type'),
    headers: (res.response || {}).headers,
    body: resBodySerializer(res.body)
  }
}

/**
 * Response body serializer
 *
 * @param {object} req Response body object
 */
function resBodySerializer (body = {}) {
  return {
    code: body['status_code'],
    message: body['status_message'],
    errors: body['errors'],
    error_code: body['error_code'],
    error_msg: body['error_message'],
    error_desc: body['error_description']
  }
}

function getIP (req) {
  return req.ip || req.connection.remoteAddress ||
    (req.socket && req.socket.remoteAddress) ||
    (req.socket.socket && req.socket.socket.remoteAddress) ||
    '127.0.0.1'
}

function doExclude (reqUri, exclusionList) {
  if (!exclusionList || exclusionList.length === 0) {
    return false
  }
  for (let i = 0; i < exclusionList.length; i++) {
    const re = pathToRegexp(exclusionList[i])
    if (re.exec(reqUri)) {
      return true
    }
  }
  return false
}
