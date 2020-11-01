'use strict'

const uuid = require('uuid')
const httpContext = require('express-http-context')

/**
 * Return a middleware that generates Request ID and
 * sets in a header.
 *
 * @return {function} Express middleware.
 */
module.exports = function (options) {
  options = options || {}
  options.uuidVersion = options.uuidVersion || 'v4'
  options.setHeader = options.setHeader === undefined || !!options.setHeader
  options.headerName = options.headerName || 'X-Request-Id'
  options.attributeName = options.attributeName || 'id'

  return function (req, res, next) {
    req[options.attributeName] = req.header(options.headerName) || uuid[options.uuidVersion](options, options.buffer, options.offset)
    httpContext.set('reqId', req[options.attributeName])
    if (options.setHeader) {
      res.setHeader(options.headerName, req[options.attributeName])
    }
    next()
  }
}
