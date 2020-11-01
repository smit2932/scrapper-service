'use strict'

const { logger, dbCons, msgCons, httpStatusCode, responseGenerators } = require('../lib/utils')
const axios = require('axios')
const cheerio = require('cheerio')
const SERVICE_CONS = 'CM_LM_'
const { upsertScrapDetails, fetchScrapDetails, removeScrappedData } = require('../repository/scrap_details')
const cachingObject = {}

const fetchDetails = async (url, tenant) => {
  try {
    logger.debug('url you looking for: %s', url)
    if (cachingObject[url]) {
      return cachingObject[url]
    } else {
      const response = doScrapMgmt(url, tenant)
      return response
    }
  } catch (error) {
    console.log(error)
    logger.warn('Error while fetching details %j %s', error, error)
    throw error
  }
}

const refreshDetails = async (tenant) => {
  try {
    const response = []
    const scrapData = await fetchScrapDetails({}, getProjectionForScrappedData(), tenant)
    if (scrapData.length > 0) {
      await removeScrappedData(tenant)
      for (const data of scrapData) {
        const updatedData = doScrapMgmt(data.url, tenant)
        response.push(updatedData)
      }
      return responseGenerators(response.length, SERVICE_CONS + httpStatusCode.OK, msgCons.MSG_DATA_UPDATED_SUCCESSFULLY, false)
    } else {
      return responseGenerators({}, SERVICE_CONS + httpStatusCode.OK, msgCons.MSG_NO_SCRAP_DATA_FOUND, false)
    }
  } catch (error) {
    console.log(error)
    logger.warn('Error while refreshing details %j %s', error, error)
    throw error
  }
}

async function doScrapMgmt (url, tenant) {
  const fetchedDetails = await scrappingFunction(url)
  saveScrapData(fetchedDetails, tenant)
  cachingObject[url] = fetchedDetails
  return fetchedDetails
}

async function scrappingFunction (url) {
  const response = await axios(url)
  return new Promise((resolve, reject) => {
    const fetchedDetails = {}
    const data = loadData(response.data)
    fetchedDetails.url = url
    return resolve({ ...fetchedDetails, ...data })
  })
}

async function saveScrapData (data, tenant) {
  const saveData = await upsertScrapDetails(getQueryForUpsertScrap(data), data, tenant)
  return saveData
}

function loadData (html) {
  const data = {}
  const images = []
  const description = []
  let price = 'N/A'
  let title
  const $ = cheerio.load(html)
  $('#imgTagWrapperId').each((i, elem) => {
    const url = $(elem).find('img').data('old-hires')
    images.push(url)
  })
  $('#productTitle').each((i, elem) => {
    title = elem.children[0].data.trim()
  })
  $('#feature-bullets').find('li').each((i, elem) => {
    if (elem.children.length > 0) {
      const feat = elem.children[0].children
      if (feat.length > 0) {
        description.push(`${feat[0].data.trim()}`)
      }
    }
  })
  if ($('#priceblock_ourprice').length > 0) {
    $('#priceblock_ourprice').each((i, elem) => {
      if (elem.children.length > 0) {
        price = elem.children[0].data
      }
    })
  }
  if ($('#priceblock_dealprice').length > 0) {
    $('#priceblock_dealprice').each((i, elem) => {
      if (elem.children.length > 0) {
        price = elem.children[0].data
      }
    })
  }
  data.images = images
  data.description = description.join(', ')
  data.price = price
  data.title = title
  return data
}

function getProjectionForScrappedData () {
  const projection = {}
  projection[dbCons.FIELD_URL] = true
  return projection
}

function getQueryForUpsertScrap (data) {
  const query = {}
  query.url = data.url
  return query
}

module.exports = {
  fetchDetails,
  refreshDetails,
  scrappingFunction
}
