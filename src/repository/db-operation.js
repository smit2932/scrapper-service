'use strict'

const {
  dbOperationCons,
  logger,
  msCons,
  dbCons,
  mergeJsons
} = require('../lib/utils')

const getQuery = (fieldName, operation, value) => {
  const query = {}
  query[fieldName] = {}
  query[fieldName][operation] = value
  logger.debug('Generated query: %j', query)
  return query
}

const getMatchedResult = (query) => {
  logger.debug('Query passed: %j', query)
  const queryToBeExecuted = {}
  queryToBeExecuted[dbOperationCons.FIELD_MATCH] = query
  logger.debug('Query to be executed: %j', queryToBeExecuted)
  return queryToBeExecuted
}

const getProjectedField = (projectedField) => {
  logger.debug('Projection passed: %j', projectedField)
  const projection = {}
  projection[dbOperationCons.FIELD_PROJECTION] = projectedField
  logger.debug('Projection to be executed: %j', projection)
  return projection
}

const getQueryArrayForOperation = (operation, query) => {
  const operatedQuery = {}
  operatedQuery[operation] = query
  logger.debug('Query operation to be executed: %j', operatedQuery)
  return operatedQuery
}

const getLookup = (from, localField, foreignField, as) => {
  const json = {}
  json[dbOperationCons.FIELD_LOOKUP] = {}
  json[dbOperationCons.FIELD_LOOKUP][dbOperationCons.FIELD_FROM] = from
  json[dbOperationCons.FIELD_LOOKUP][dbOperationCons.FIELD_LOCAL_FIELD] = localField
  json[dbOperationCons.FIELD_LOOKUP][dbOperationCons.FIELD_FOREIGN_FIELD] = foreignField
  json[dbOperationCons.FIELD_LOOKUP][dbOperationCons.FIELD_AS] = as
  logger.debug('Lookup operation to be executed: %j', json)
  return json
}

const getUnwindedResponse = (unwindObject) => {
  const json = {}
  json[dbOperationCons.FIELD_UNWIND] = unwindObject
  logger.debug('Unwind operation to be executed: %j', json)
  return json
}

const getGroupObject = (groupObject) => {
  const json = {}
  json[dbOperationCons.FIELD_GROUP] = groupObject
  logger.debug('Group operation to be executed: %j', json)
  return json
}

const getOrderedJson = (value) => {
  const json = {}
  json[dbOperationCons.FIELD_ORDERED] = value
  logger.debug('Ordered operation to be executed while inserting: %j', json)
  return json
}

const getUpdatedJsonInResponse = (value) => {
  const json = {}
  json[dbOperationCons.FIELD_NEW] = value
  logger.debug('Get query to fetch updated json or old json: %j', json)
  return json
}

const getUpdatedJsonInResponseWithProjection = (status, projectionFieldArray) => {
  const json = {}
  json[dbOperationCons.FIELD_NEW] = status
  json[msCons.FIELD_PROJECTION] = projectionFieldArray
  logger.debug('Get query to fetch updated json or old json: %j', json)
  return json
}

const getUpdateJsonFormat = (updateJson) => {
  const json = {}
  json[dbOperationCons.OP_SET] = updateJson
  logger.debug('Update Json Format: %j', json)
  return json
}

const updateAllValues = (value) => {
  const json = {}
  json[dbOperationCons.FIELD_MULTI] = value
  logger.debug('Get query to update all match document or only single doc: %j', json)
  return json
}

const getQueryJsonForElementMatch = (parameter, elemMatchValue) => {
  const query = {}
  query[parameter] = {}
  query[parameter][dbOperationCons.OP_ELEM_MATCH] = elemMatchValue
  return query
}

const getQueryJsonForRegexOp = (value, caseSensitive) => {
  const query = {}
  query[dbOperationCons.OP_REGEX] = value
  if (caseSensitive) {
    query[dbOperationCons.FIELD_OPTIONS] = dbOperationCons.FIELD_CASE_INSENSITIVE
  }
  return query
}

const getCommonProjection = () => {
  const projection = {}
  projection[dbCons.COMMON_CREATED_BY] = false
  projection[dbCons.COMMON_UPDATED_BY] = false
  projection[dbCons.COMMON_CREATED_ON] = false
  projection[dbCons.COMMON_UPDATED_ON] = false
  projection[dbCons.FIELD__ID] = false
  projection[dbCons.FIELD_OBJECTTYPE] = false
  return projection
}

const getSortJson = (json) => {
  const sortJson = {}
  sortJson[dbOperationCons.OP_SORT] = json
  return sortJson
}

const getSkipJson = (skipValue) => {
  const skipJson = {}
  skipJson[dbOperationCons.OP_SKIP] = skipValue
  return skipJson
}

const getLimitJson = (limit) => {
  const limitJson = {}
  limitJson[dbOperationCons.OP_LIMIT] = limit
  return limitJson
}

const getMapReduceOutputJson = () => {
  const outputJson = {}
  outputJson[dbOperationCons.FIELD_INLINE] = 1
  return outputJson
}

const getMapReduceJson = (query, regexMapfunction, reduceFunction, outputJson, extraParams) => {
  let mapReduceJson = {}
  mapReduceJson[dbOperationCons.FIELD_QUERY] = query
  mapReduceJson[dbOperationCons.FIELD_OUT] = outputJson
  mapReduceJson[dbOperationCons.FIELD_MAP] = regexMapfunction
  mapReduceJson[dbOperationCons.FIELD_REDUCE] = reduceFunction
  if (extraParams !== undefined) {
    mapReduceJson = mergeJsons(mapReduceJson, extraParams)
  }
  return mapReduceJson
}

const getUpdatePushJson = (updateJson) => {
  const pushJson = {}
  pushJson[dbOperationCons.FIELD_PUSH] = updateJson
  return pushJson
}

const getFinalQueryJson = (query) => {
  const isDeconsteQueryJson = {}
  isDeconsteQueryJson[dbCons.COMMON_IS_DELETED] = dbCons.VALUE_DEFAULT_IS_DELETED
  const queryJson = {}
  queryJson[dbOperationCons.OP_AND] = [query]
  queryJson[dbOperationCons.OP_AND].push(isDeconsteQueryJson)
  return queryJson
}

const getAddToSetJson = (updateJson) => {
  const json = {}
  json[dbOperationCons.OP_ADD_TO_SET] = updateJson
  logger.debug('Update Json Format: %j', json)
  return json
}

module.exports = {
  getQuery,
  getGroupObject,
  getMatchedResult,
  getProjectedField,
  getQueryArrayForOperation,
  getLookup,
  getUnwindedResponse,
  getOrderedJson,
  getUpdatedJsonInResponse,
  getUpdateJsonFormat,
  updateAllValues,
  getQueryJsonForElementMatch,
  getQueryJsonForRegexOp,
  getCommonProjection,
  getSortJson,
  getSkipJson,
  getLimitJson,
  getMapReduceOutputJson,
  getMapReduceJson,
  getUpdatePushJson,
  getUpdatedJsonInResponseWithProjection,
  getFinalQueryJson,
  getAddToSetJson
}
