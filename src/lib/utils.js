'use strict'
const logger = require('../lib/logger')
const config = require('config')
const logs = config.get('logs')
const Buffer = require('safe-buffer').Buffer
const httpContext = require('express-http-context')

const self = module.exports = {
  urlCons: require('../constants/url-constants'),
  configCons: require('../constants/config-constants'),
  dbCons: require('../constants/db-constants'),
  msCons: require('../constants/ms-constants'),
  msgCons: require('../constants/msg-constants'),
  httpStatusCode: require('http-status-codes'),
  logCons: require('../constants/log-constants'),
  dbOperationCons: require('../constants/db-operation-constants'),
  config: require('config'),
  logger: require('../lib/logger'),
  getAllowHeader: function () {
    var json = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Expose-Headers': 'Authorization, File-Name',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization,token,orgName,user_code,File-Name',
      'Access-Control-Request-Methods': 'POST, GET, PUT, DELETE, OPTIONS'
    }
    return json
  },

  responseGenerators: function (responseData, responseStatusCode, responseStatusMsg, responseErrors) {
    var responseJson = {}
    responseJson['data'] = responseData
    responseJson['status_code'] = responseStatusCode
    responseJson['status_message'] = responseStatusMsg

    // errors
    if (responseErrors === undefined) {
      responseJson['response_error'] = []
    } else {
      responseJson['response_error'] = responseErrors
    }

    return responseJson
  },

  errorsArrayGenrator: function (errorArray, code, msg, data) {
    var responseJson = {}
    if (typeof errorArray !== 'undefined' || errorArray.length > 0) {
      responseJson['errors'] = errorArray
    } else {
      responseJson['errors'] = []
    }

    // CODE
    if (typeof code === 'undefined') {
      responseJson['status_code'] = '500'
    } else {
      responseJson['status_code'] = code
    }

    // MSG
    if (typeof msg === 'undefined') {
      responseJson['status_message'] = 'server error'
    } else {
      responseJson['status_message'] = msg
    }

    // DATA
    if (typeof data === 'undefined') {
      responseJson['data'] = {}
    } else {
      responseJson['data'] = data
    }
    return responseJson
  },

  /**
   * get orgName from request
   *
   * maping : 1=headers,2=params,3=query,4=body,5=root
   */
  getOrgName: function (req, fromWhere) {
    if (fromWhere === undefined) {
      fromWhere = 1
    }
    var org = []
    var orgTemp = self.getOrgField(req, fromWhere)
    if (!orgTemp) {
      orgTemp = config.database.default_org_name
    }
    org = orgTemp.split('-')
    if (!org[1]) {
      org[1] = org[0]
      org[0] = '-1'
    }
    if (fromWhere !== 5) {
      req.query.env = org[0]
    }
    return org
  },
  /**
   * get orgName from different path of request
   *
   */
  getOrgField: function (json, fromWhere) {
    switch (fromWhere) {
      case 1:
        return json.headers.orgname
      case 2:
        return json.params.orgname
      case 3:
        return json.query.orgname
      case 4:
        return json.body.orgname
      case 5:
        return json.orgname
    }
  },
  /**
   * get domain name from hostName
   *
   * maping : 1=headers,2=params,3=query,4=body,5=root
   */
  getDomainName: function (hostName) {
    var hostNameArray = hostName.split('.')
    var domainName = hostNameArray[hostNameArray.length - 2]
    var appDomainNames = config.domain_names
    var suffixName = appDomainNames[domainName]
      ? appDomainNames[domainName]
      : appDomainNames.default_domain_name
    return suffixName
  },

  /**
   * get url map from request
   *
   */
  getUrlMap: function (req, fromWhere) {
    if (fromWhere === undefined) {
      fromWhere = 1
    }
    const json = {}
    json[self.urlCons.PARAM_ORG_NAME] = self.getOrgField(req, fromWhere)
    json[self.urlCons.PARAM_DOMAIN_NAME] = req.query[self.urlCons.PARAM_DOMAIN_NAME] ? req.query[self.urlCons.PARAM_DOMAIN_NAME] : req.headers[self.urlCons.PARAM_DOMAIN_NAME]
    // const org = self.getOrgName(req)
    // json[self.urlCons.PARAM_ENV] = org[0]
    json[self.urlCons.PARAM_ENV] = (req.query[self.urlCons.PARAM_ENV]) ? req.query[self.urlCons.PARAM_ENV] : '-1'
    logger.info('urlMap in getUrlMap() =  ' + JSON.stringify(json))
    return json
  },

  /**
   * generate Url for other MS/UI
   */
  generateUrl: function (protocol, host, port, env, urlMap, path) {
    let domain
    logger.debug('ENTER: generateUrl()')
    logger.debug('urlMap= ' + JSON.stringify(urlMap))
    logger.debug('host= ' + JSON.stringify(host))
    logger.debug('env= ' + env)
    if (self.validateIPAddress(host[urlMap[self.urlCons.PARAM_DOMAIN_NAME]])) {
      domain = host[urlMap[self.urlCons.PARAM_DOMAIN_NAME]]
      logger.info('host ' + domain + ' is ip address or localhost')
    } else {
      let domainName = urlMap[self.urlCons.PARAM_DOMAIN_NAME]
      let defaultHostName = config.get(self.configCons.FIELD_DEFAULT_HOST_NAME)
      let hostName = host[domainName] ? host[domainName] : defaultHostName
      let orgName = urlMap[self.urlCons.PARAM_ORG_NAME]
      domain = (env === '-1' ? '' : (env + '-')) + orgName + '.' + hostName
      logger.info('host is not ip address host=' + domain)
    }
    let url = protocol + '://' + domain + ':' + port + path
    logger.debug('generated url=' + url)
    logger.debug('EXIT: generateUrl()')

    return url
  },

  /**
   * verify the IP is valid
   **/
  validateIPAddress: (ipaddress) => {
    if (ipaddress.indexOf('localhost') === 0 || /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
      return (true)
    }
    return (false)
  },
  /**
   * this method will check jsonObject is array or not.
   * @param {JSON} jsonObject
   */
  convertIntoArray: function (jsonObject) {
    if (!Array.isArray(jsonObject)) {
      return [jsonObject]
    }
    return jsonObject
  },
  /**
   * this method will return given field value array from json
   *
   *
   * @param {String} field
   * @return {Json} json
   */
  getValuesArrayFromJson: (field, json) => {
    var arrayJson = !Array.isArray(json) ? [json] : json
    var valueArray = []
    arrayJson.forEach(function (resultObject) {
      if (resultObject[field]) valueArray.push(resultObject[field])
    })
    return valueArray
  },

  /**
   * this method will return given field value array from json
   *
   *
   * @param {String} field
   * @return {Json} json
   */
  getNestedValuesArrayFromJson: (field, nestedField, json) => {
    var arrayJson = !Array.isArray(json) ? [json] : json
    var valueArray = []
    arrayJson.forEach(function (resultObject) {
      valueArray.push(resultObject[field][nestedField])
    })
    return valueArray
  },

  toTitleCase: (string) => {
    return string.replace(
      /\w\S*/g,
      function (text) {
        return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()
      }
    )
  },

  isEmpty (object) {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        return false
      }
    }
    return true
  },

  /**
   * filter from array
   **/
  filterBasedOnValue: function filterBasedOnValue (inputArray, field, value) {
    var filteredValue = inputArray.filter(function (item) {
      return item[field] === value
    })
    logger.debug(`filteredValue = ${JSON.stringify(filteredValue)}`)
    return filteredValue
  },

  /**
   * filter from nested array
   **/
  filterBasedOnNestedValue: function filterBasedOnNestedValue (inputNestedArray, field, nestedField, value) {
    // logger.debug('ENTER: filterBasedOnNestedValue()')
    var filteredNestedValues = inputNestedArray.filter(function (item) {
      return item[field][nestedField] === value
    })
    // logger.debug(`filteredNestedValues = ${JSON.stringify(filteredNestedValues)}`)
    // logger.debug('EXIT: filterBasedOnNestedValue()')
    return filteredNestedValues
  },

  /**
   * response json payload
   *
   * @param {String} code error code
   * @param {String} msg error msg
   *
   */
  errorObjectGenrator: function (code, msg) {
    var responseJson = {}
    // CODE
    if (typeof code === 'undefined') {
      responseJson['error_code'] = 500
    } else {
      responseJson['error_code'] = code
    }

    // MSG
    if (msg === undefined) {
      responseJson['error_message'] = self.msgCons.MSG_ERROR_SERVER_ERROR
    } else {
      responseJson['error_message'] = msg
    }

    return responseJson
  },

  /**
 * get Status Code
 */
  getStatusCode: function getStatusCode (statusCode) {
    logger.debug('statusCode =' + statusCode)
    if (statusCode === undefined) {
      statusCode = 'DF_ER_500'
    }
    var status = statusCode.split('_')
    return status[status.length - 1]
  },

  /**
 * Merge object b with object a.
 *
 * var a = { z: '123' } , b = { y: '456' }; => { z: '123', y: '456' }
 *
 * @param {Json} a
 * @param {Json} b
 * @return {Json}
 */
  mergeJsons: function (a, b) {
    if (a && b) {
      for (var key in b) {
        a[key] = b[key]
      }
    }
    return a
  },

  /**
   *  useful for doing average of the number
   **/
  averageOfNumber: function (element) {
    var sum = 0
    for (var i = 0; i < element.length; i++) {
      sum += parseFloat(element[i], 10) // don't forget to add the base
    }
    var avg = sum / element.length
    return avg
  },

  /**
   *  useful for converting array of numbers into array of string
   **/
  convertIntoStringArray: function (ids) {
    logger.debug('ENTER: convertIntoStringArray()')
    let json = []
    for (let id of ids) {
      json.push(String(id))
    }
    logger.debug('EXIT: convertIntoStringArray()')
    return json
  },

  /**
   * Concat Two Arrays
   * @param  {Array} array1 []
   * @param  {Array} array2 []
   * @return {Array}        []
   */
  concatArrays: function (array1, array2) {
    let temp = array2.concat(array1)
    array2 = temp
    return array2
  },

  replaceKey: function (data, fieldToReplace, newField) {
    logger.debug('ENTER: replaceKey()')
    let json = []
    for (let object of data) {
      let value = object[fieldToReplace]
      delete object[fieldToReplace]
      object[newField] = value
      json.push(object)
    }
    logger.debug('EXIT: replaceKey()')
    return json
  },
  /**
   * mask sensitive data in message
   * Example:
   * masking_character: "#"
   * message: "email":"example@domain.com", "contact":"+911234567890"
   * returns: "email":"######@domain.com", "contact":"+########7890"
   *
   * @param  {String} message
   */
  maskSensitiveData: function (message) {
    const logsConfigs = logs.obfuscate
    Object.keys(logsConfigs.types).forEach(key => {
      const regexToFind = new RegExp(logsConfigs.types[key].find, 'gmi')
      const regexToMask = new RegExp(logsConfigs.types[key].replace, 'gmi')
      const maskedData = message.replace(regexToFind, capture => {
        return capture.replace(regexToMask, logsConfigs.masking_character)
      })
      message = maskedData
    })
    return message
  },

  mapBasedOnValue: function mapBasedOnValue (inputArray, keyField, valueField) {
    const mapKeyValueJson = {}
    inputArray.map(function (item) {
      mapKeyValueJson[item[keyField]] = item[valueField]
    })
    return mapKeyValueJson
  },

  generateKeyValueJson: function generateKeyValueJson (inputArray, keyField) {
    const mapKeyValueJson = {}
    inputArray.map(function (item) {
      mapKeyValueJson[item[keyField]] = item
    })
    return mapKeyValueJson
  },
  /**
   * self method will accept string and encode it using base64
   * const json = { z: '123' } => eyJ6IjoiMTIzIn0=
   *
   * @param {Json} json
   * @return {String} encodedString
   */
  encodeUsingBase64: (json) => {
    return new Buffer(JSON.stringify(json)).toString('base64')
  },
  /**
   * self method will accept base64 encoded string and decode it
   *   const encodedString = 'eyJ6IjoiMTIzIn0=' => { z: '123' }
   *
   * @param {String} encodedString
   * @return {Json} decodedString
   */
  decodeUsingBase64: (encodedString) => {
    return new Buffer(encodedString, 'base64').toString('ascii')
  },

  swapJsonKeyToValue: (json) => {
    const response = {}
    for (let key in json) {
      response[json[key]] = key
    }
    return response
  },

  generateFinalEncDecBody: function (data) {
    if (!Array.isArray(data)) data = [ data ]
    return [
      {
        resources: data
      }
    ]
  },

  getContextForUnleash: (orgNameMap) => {
    const context = {}
    const orgNameMapArray = orgNameMap.split('_')
    context.user_code = httpContext.get('userCode') || undefined
    context.is_resource = httpContext.get('isResource') || false
    context.env = httpContext.get('env') || -1
    context.orgname = orgNameMapArray[0]
    context.domain_name = orgNameMapArray[1]
    return context
  }
}
