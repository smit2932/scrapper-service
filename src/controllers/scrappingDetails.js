'use strict'

const { responseGenerators, errorsArrayGenrator, msgCons, getUrlMap, logger, getStatusCode, configCons } = require('../lib/utils')
const httpStatusCode = require('http-status-codes')
const httpContext = require('express-http-context')
const fetchDetailsService = require('../services/fetchDetailsService')

const getScrappingDetails = async (req, res, next) => {
  const tenant = httpContext.get('tenant')
  const url = req.body[configCons.FIELD_URL]
  try {
    const response = await fetchDetailsService.fetchDetails(url, tenant)
    if (response[msgCons.RESPONSE_STATUS_CODE] !== undefined && getStatusCode(response[msgCons.RESPONSE_STATUS_CODE]) !== undefined) {
      res.status(getStatusCode(response[msgCons.RESPONSE_STATUS_CODE])).json(response)
    } else if (response.length === 0) {
      res.status(httpStatusCode.NO_CONTENT).json(responseGenerators(response, msgCons.CODE_NO_CONTENT_AVAILABLE, msgCons.MSG_ERROR_NO_DATA))
    } else {
      res.status(httpStatusCode.OK).json(responseGenerators(response, msgCons.CODE_SERVER_OK, msgCons.MSG_LOOKUP_DATA_FETCH_SUCCESSFULLY))
    }
  } catch (error) {
    if (error[msgCons.RESPONSE_STATUS_CODE] && getStatusCode(error[msgCons.RESPONSE_STATUS_CODE]) !== String(httpStatusCode.INTERNAL_SERVER_ERROR)) {
      res.status(getStatusCode(error[msgCons.RESPONSE_STATUS_CODE])).send(error)
    } else {
      logger.error('Error while authentication of user: %j', error)
      res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(errorsArrayGenrator(error, msgCons.CODE_INTERNAL_ERROR, msgCons.MSG_ERROR_SERVER_ERROR))
    }
  }
}

const updateScrapData = async (req, res, next) => {
  const tenant = httpContext.get('tenant')
  try {
    const response = await fetchDetailsService.refreshDetails(tenant)
    console.log(response)
    if (response[msgCons.RESPONSE_STATUS_CODE] !== undefined && getStatusCode(response[msgCons.RESPONSE_STATUS_CODE]) !== undefined) {
      res.status(getStatusCode(response[msgCons.RESPONSE_STATUS_CODE])).json(response)
    } else if (response.length === 0) {
      res.status(httpStatusCode.NO_CONTENT).json(responseGenerators(response, msgCons.CODE_NO_CONTENT_AVAILABLE, msgCons.MSG_ERROR_NO_DATA))
    } else {
      res.status(httpStatusCode.OK).json(responseGenerators(response, msgCons.CODE_SERVER_OK, msgCons.MSG_LOOKUP_DATA_FETCH_SUCCESSFULLY))
    }
  } catch (error) {
    if (error[msgCons.RESPONSE_STATUS_CODE] && getStatusCode(error[msgCons.RESPONSE_STATUS_CODE]) !== String(httpStatusCode.INTERNAL_SERVER_ERROR)) {
      res.status(getStatusCode(error[msgCons.RESPONSE_STATUS_CODE])).send(error)
    } else {
      logger.error('Error while authentication of user: %j', error)
      res.status(httpStatusCode.INTERNAL_SERVER_ERROR).send(errorsArrayGenrator(error, msgCons.CODE_INTERNAL_ERROR, msgCons.MSG_ERROR_SERVER_ERROR))
    }
  }
}

module.exports = {
  getScrappingDetails,
  updateScrapData
}
