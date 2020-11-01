'use strict'

const debug = require('debug')('httpContext')
const { urlCons, getOrgName, getDomainName } = require('../lib/utils')
const httpContext = require('express-http-context')

module.exports = function (opts = {}) {
  opts.isResource = opts.isResource || false

  return function (req, res, next) {
    // Tenant name
    const tenantName = getOrgNameFromReq(req) + '_' + getDomainNameFromReq(req)
    debug('tenant=%s', tenantName)
    httpContext.set('tenant', tenantName)

    // Is resource
    req[opts.isResource] = req.query['is_resource'] || opts.isResource
    debug('isResource=%s', req[opts.isResource])
    httpContext.set('isResource', req[opts.isResource])

    // User code
    req[opts.userCode] = req.headers['user_code']
    debug('userCode=%s', req[opts.userCode])
    httpContext.set('userCode', req[opts.userCode])

    // Token
    req[opts.token] = req.headers['token']
    debug('token=%s', req[opts.token])
    httpContext.set('token', req[opts.token])

    // Call next middleware in the chain
    next()
  }
}

function getOrgNameFromReq (req) {
  const org = getOrgName(req)
  req.headers[urlCons.PARAM_ENV] = org[0]
  httpContext.set('env', org[0])
  req.headers[urlCons.PARAM_ORG_NAME] = org[1]
  return org[1]
}

function getDomainNameFromReq (req) {
  const domainName = getDomainName(req.get('host'))
  req.headers[urlCons.PARAM_DOMAIN_NAME] = domainName
  return domainName
}
